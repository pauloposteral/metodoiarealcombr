

# Botão Hero → Scroll para Conteúdo Principal

## Mudança
Alterar o botão "Quero aprender IA na prática" no HeroSection para fazer scroll até a seção de módulos (`#modulos`) em vez de abrir o checkout.

## Arquivo: `src/components/sections/HeroSection.tsx`

- Remover `onClick={handleCheckout}` e `disabled={isLoading}` do botão
- Transformar em link âncora `<a href="#modulos">` usando `asChild`
- Remover imports não utilizados (`useCheckout`, `CheckoutDialog`, `Loader2`)
- Remover o componente `<CheckoutDialog />` e estado relacionado

O botão ficará como:
```tsx
<Button variant="hero" size="lg" className="..." asChild>
  <a href="#modulos">
    Quero aprender IA na prática
    <ArrowRight className="..." />
  </a>
</Button>
```

