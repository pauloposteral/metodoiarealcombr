import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GreennClient {
  id: number;
  name: string;
  email: string;
  phone_local_code?: string;
  phone_number?: string;
  doc?: string;
}

interface GreennProduct {
  id: number;
  name: string;
}

interface GreennSale {
  id: number;
  amount: number;
  currentStatus: string;
  paymentMethod?: string;
}

interface GreennPayload {
  sale: GreennSale;
  client: GreennClient;
  product: GreennProduct;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse the webhook payload
    const payload: GreennPayload = await req.json();
    console.log('Received Greenn webhook:', JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.sale || !payload.client || !payload.product) {
      console.error('Invalid payload structure');
      return new Response(
        JSON.stringify({ error: 'Invalid payload structure' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sale, client, product } = payload;
    const status = sale.currentStatus;

    console.log(`Processing event: ${status} for sale ${sale.id}, client: ${client.email}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Handle different payment statuses
    switch (status) {
      case 'paid':
        await handlePaidEvent(supabase, sale, client, product, payload);
        break;
      
      case 'refunded':
      case 'chargedback':
        await handleRevokeEvent(supabase, sale, client, status, payload);
        break;
      
      case 'waiting_payment':
        await handlePendingEvent(supabase, sale, client, product, payload);
        break;
      
      case 'refused':
      case 'unpaid':
        await handleFailedEvent(supabase, sale, client, product, status, payload);
        break;
      
      default:
        console.log(`Unknown status: ${status}, recording anyway`);
        await recordPurchase(supabase, sale, client, product, status, null, payload);
    }

    return new Response(
      JSON.stringify({ success: true, status: 'processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handlePaidEvent(
  supabase: any,
  sale: GreennSale,
  client: GreennClient,
  product: GreennProduct,
  rawPayload: GreennPayload
) {
  console.log(`Handling PAID event for ${client.email}`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(
    (u: any) => u.email?.toLowerCase() === client.email.toLowerCase()
  );

  let userId: string;

  if (existingUser) {
    console.log(`User already exists: ${existingUser.id}`);
    userId = existingUser.id;
    
    // Update profile to active status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        access_status: 'active',
        full_name: client.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    }
  } else {
    // Generate a temporary password
    const tempPassword = generateTempPassword();
    
    // Create new user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: client.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: client.name,
        phone: client.phone_number ? `${client.phone_local_code || ''}${client.phone_number}` : null,
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    userId = newUser.user.id;
    console.log(`Created new user: ${userId}`);

    // Update profile with access_status active
    // The trigger should create the profile, but we update to ensure access_status
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for trigger
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: client.name,
        access_status: 'active',
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Log credentials (in production, you'd send an email)
    console.log(`New user created with email: ${client.email}, temp password: ${tempPassword}`);
    
    // TODO: Send welcome email with credentials
    // You can integrate with Resend or another email service here
  }

  // Record the purchase
  await recordPurchase(supabase, sale, client, product, 'paid', userId, rawPayload);
  
  console.log(`Successfully processed PAID event for ${client.email}`);
}

async function handleRevokeEvent(
  supabase: any,
  sale: GreennSale,
  client: GreennClient,
  status: string,
  rawPayload: GreennPayload
) {
  console.log(`Handling REVOKE event (${status}) for ${client.email}`);

  // Find user by email
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const user = existingUsers?.users?.find(
    (u: any) => u.email?.toLowerCase() === client.email.toLowerCase()
  );

  if (user) {
    // Revoke access
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        access_status: 'revoked',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error revoking access:', updateError);
    }

    // Update purchase record
    const { error: purchaseError } = await supabase
      .from('purchases')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('greenn_sale_id', sale.id);

    if (purchaseError) {
      console.error('Error updating purchase:', purchaseError);
    }

    console.log(`Access revoked for user ${user.id}`);
  } else {
    console.log(`User not found for email: ${client.email}`);
  }
}

async function handlePendingEvent(
  supabase: any,
  sale: GreennSale,
  client: GreennClient,
  product: GreennProduct,
  rawPayload: GreennPayload
) {
  console.log(`Handling PENDING event for ${client.email}`);
  
  // Just record the pending purchase for follow-up
  await recordPurchase(supabase, sale, client, product, 'waiting_payment', null, rawPayload);
}

async function handleFailedEvent(
  supabase: any,
  sale: GreennSale,
  client: GreennClient,
  product: GreennProduct,
  status: string,
  rawPayload: GreennPayload
) {
  console.log(`Handling FAILED event (${status}) for ${client.email}`);
  
  // Record the failed attempt
  await recordPurchase(supabase, sale, client, product, status, null, rawPayload);
}

async function recordPurchase(
  supabase: any,
  sale: GreennSale,
  client: GreennClient,
  product: GreennProduct,
  status: string,
  userId: string | null,
  rawPayload: GreennPayload
) {
  const phone = client.phone_number 
    ? `${client.phone_local_code || ''}${client.phone_number}` 
    : null;

  const { error } = await supabase
    .from('purchases')
    .upsert({
      greenn_sale_id: sale.id,
      greenn_client_id: client.id,
      user_id: userId,
      product_name: product.name,
      product_id: product.id,
      amount: sale.amount,
      status: status,
      payment_method: sale.paymentMethod || null,
      client_email: client.email,
      client_name: client.name,
      client_phone: phone,
      client_document: client.doc || null,
      raw_payload: rawPayload,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'greenn_sale_id'
    });

  if (error) {
    console.error('Error recording purchase:', error);
    throw error;
  }

  console.log(`Purchase recorded: sale ${sale.id}, status: ${status}`);
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
