import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** Fail closed. The one temporary exception is limited to exact dev-only versions. */
export function evaluateAudit(report, lock, policy, today = new Date().toISOString().slice(0,10)) {
  if (report.auditReportVersion !== 2 || !report.vulnerabilities || report.error) throw new Error('Invalid npm audit response; no exception can be applied.');
  const accepted=[]; const blocked=[];
  const vulnerabilities=report.vulnerabilities;
  function onlyReviewedAdvisory(name, seen=new Set()) {
    if(seen.has(name)) return false;
    const item=vulnerabilities[name]; if(!item?.via?.length) return false;
    const next=new Set(seen); next.add(name);
    return item.via.every(v => typeof v === 'string' ? onlyReviewedAdvisory(v,next) : v.url === policy.advisory);
  }
  for(const [name,item] of Object.entries(vulnerabilities)) {
    if(!['moderate','high','critical'].includes(item.severity)) continue;
    const valid = today <= policy.expires && item.severity !== 'critical' && policy.packages[name] && item.nodes?.length &&
      item.nodes.every(node => lock.packages?.[node]?.dev === true && lock.packages[node].version === policy.packages[name]) && onlyReviewedAdvisory(name);
    (valid ? accepted : blocked).push(name);
  }
  return {accepted,blocked};
}

if(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const run=spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm',['audit','--json'],{encoding:'utf8',shell:process.platform === 'win32',maxBuffer:16*1024*1024});
  if(run.error || ![0,1].includes(run.status)) throw new Error(`npm audit could not complete: ${run.error?.message ?? run.stderr}`);
  const report=JSON.parse(run.stdout);
  const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
  const policy=JSON.parse(fs.readFileSync('scripts/security/build-only-exception.json','utf8'));
  const result=evaluateAudit(report,lock,policy);
  fs.mkdirSync('docs/audit/2026-10-20',{recursive:true});
  fs.writeFileSync('docs/audit/2026-10-20/dependency-audit.json',JSON.stringify({checkedAt:new Date().toISOString(),...result,policy,report},null,2));
  if(result.accepted.length) console.warn(`NOT ZERO ADVISORIES: ${result.accepted.length} dev-only dependency nodes match ${policy.advisory}. Exception expires ${policy.expires}. See docs/SECURITY-BUILD-EXCEPTION.md.`);
  if(result.blocked.length) { console.error('Release blocked by unreviewed or expired findings:',result.blocked.join(', ')); process.exitCode=1; }
  else console.log('No unreviewed moderate/high/critical findings. Raw audit is retained; build must also enforce the runtime exclusion.');
}
