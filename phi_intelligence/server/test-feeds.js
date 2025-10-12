import Parser from 'rss-parser';
import { NEWS_SOURCES } from './config/newsSources.ts';

const parser = new Parser({
  headers: {
    'User-Agent': 'NewsBot/1.0 (+https://phi-intelligence.com)'
  }
});

async function testFeed(source) {
  try {
    console.log(`\n🔍 Testing: ${source.name}`);
    console.log(`   URL: ${source.rssUrl}`);
    
    const feed = await parser.parseURL(source.rssUrl);
    
    console.log(`   ✅ Status: WORKING`);
    console.log(`   📰 Articles found: ${feed.items.length}`);
    console.log(`   📅 Last updated: ${feed.lastBuildDate || 'Unknown'}`);
    
    if (feed.items.length > 0) {
      const latest = feed.items[0];
      console.log(`   📝 Latest article: "${latest.title?.substring(0, 60)}..."`);
      console.log(`   🔗 Link: ${latest.link}`);
      console.log(`   📅 Published: ${latest.pubDate || latest.isoDate || 'Unknown'}`);
    }
    
    return { status: 'working', articles: feed.items.length };
  } catch (error) {
    console.log(`   ❌ Status: FAILED`);
    console.log(`   🚨 Error: ${error.message}`);
    return { status: 'failed', error: error.message };
  }
}

async function testAllFeeds() {
  console.log('🚀 Testing RSS Feed Health...\n');
  
  const results = [];
  
  for (const source of NEWS_SOURCES) {
    const result = await testFeed(source);
    results.push({ ...result, name: source.name, type: source.type });
    
    // Small delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('==========');
  
  const working = results.filter(r => r.status === 'working');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log(`✅ Working: ${working.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n🚨 Failed Feeds:');
    failed.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
  }
  
  console.log('\n🎯 Working Feeds:');
  working.forEach(w => console.log(`   ✅ ${w.name} (${w.articles} articles)`));
}

// Run the test
testAllFeeds().catch(console.error);
