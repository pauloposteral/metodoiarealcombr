import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url = new URL('../src/lib/labResources.ts', import.meta.url);
const lib = fs.existsSync(url) ? await import(url.href) : {};
const videos = lib.labVideos ?? [];
const repos = lib.labRepositories ?? [];

test('Nine external videos are attributed and individually checked, not presented as our video production', () => {
  assert.equal(videos.length, 9);
  assert.equal(new Set(videos.map(x => x.videoId)).size, videos.length);
  for (const v of videos) {
    assert.match(v.videoId, /^[A-Za-z0-9_-]{11}$/);
    assert.ok(v.author && v.originalTitle && v.title && ['pt', 'en'].includes(v.language));
    assert.equal(v.reviewScope, 'metadata-and-description');
    assert.ok(v.durationSeconds > 0 && v.exercise.length > 60 && v.caution.length > 30);
    assert.equal(v.checkedAt, '2026-10-20');
    assert.ok(Date.parse(v.publishedAt) <= Date.parse(v.checkedAt + 'T23:59:59Z'));
  }
});
test('Canonical video URLs cannot be injected through an untrusted identifier', () => {
  assert.equal(lib.youtubeEmbedUrl?.('rqvtLxwMklo'), 'https://www.youtube-nocookie.com/embed/rqvtLxwMklo?rel=0');
  for(const id of ['https://evil.test', '../secret', 'abc', 'abc12345678?autoplay=1', '<script>']) assert.equal(lib.youtubeEmbedUrl?.(id), null);
});
test('Video filter accepts accents, author and topic without inventing results', () => {
  assert.ok(lib.filterLabVideos?.(videos, 'automação', 'all').some(x => x.videoId === '4BVTkqbn_tY'));
  assert.equal(lib.filterLabVideos?.(videos, 'SUPABASE', 'all').length, 2);
  assert.equal(lib.filterLabVideos?.(videos, 'inexistente_zz', 'all').length, 0);
  assert.equal(lib.filterLabVideos?.(videos, '', 'design').length, 2);
});
test('Known Portuguese subtitles are distinguished from a translation option', () => {
  assert.equal(videos.find(x => x.videoId === 'Ow_Uzedfohk')?.captionsPt, true);
  assert.ok(videos.filter(x => x.language === 'en' && x.videoId !== 'Ow_Uzedfohk').every(x => x.captionsPt === false));
});
test('Repository catalogue contains original sources with license cautions and no install commands', () => {
  assert.equal(repos.length, 11);
  assert.equal(new Set(repos.map(x => x.repo)).size, repos.length);
  for (const repo of repos) {
    assert.match(repo.repo, /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
    assert.ok(repo.purpose.length > 30 && repo.caution.length > 30);
    assert.ok(repo.license && repo.docs.startsWith('https://'));
    assert.ok(!Object.hasOwn(repo, 'installCommand'));
  }
  assert.match(repos.find(x => x.repo === 'n8n-io/n8n')?.license ?? '', /source-available/i);
  assert.equal(repos.find(x => x.repo === 'firecrawl/firecrawl')?.license, 'AGPL-3.0');
});
test('Missions lead to one stable additional course, not to a changed main certificate', () => {
  assert.equal(lib.labMissions?.length, 6);
  assert.equal(lib.LAB_COURSE_SLUG, 'laboratorio-apps-ia');
  assert.ok(lib.labMissions.every(x => x.outcome.length > 20 && x.title && x.lessonNumbers.length === 2));
});
test('Duration is metadata-based and never claimed as original lesson hours', () => {
  assert.equal(lib.videoDuration?.(1478), '24:38');
  assert.equal(lib.videoDuration?.(0), '0:00');
});
test('Public resources contain no protected lesson bodies or remote thumbnail URLs', () => {
  assert.ok(videos.length > 0);
  assert.ok(videos.every(v => !Object.hasOwn(v, 'transcript') && !Object.hasOwn(v, 'thumbnail')));
});

test('Portuguese audio is filterable and never confused with English subtitles', () => {
  assert.equal(lib.filterLabVideos?.(videos, '', 'all', 'pt').length, 2);
  assert.equal(lib.filterLabVideos?.(videos, '', 'all', 'en').length, 7);
});
