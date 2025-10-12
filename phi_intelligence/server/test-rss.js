import Parser from 'rss-parser';
import axios from 'axios';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'dc:creator', 'category', 'content:encoded']
  }
});

// Test RSS feeds from our configuration
const testFeeds = [
  {
    name: "DeepMind Blog",
    url: "https://deepmind.com/blog/feed/basic/"
  },
  {
    name: "Google AI Blog",
    url: "https://ai.googleblog.com/feeds/posts/default"
  },
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss/"
  },
  {
    name: "arXiv - AI",
    url: "https://export.arxiv.org/rss/cs.AI"
  },
  {
    name: "MIT News - AI",
    url: "http://news.mit.edu/topic/artificial-intelligence2/feed"
  }
];

async function testRSSFeed(name, url) {
  try {
    console.log(`\n🔍 Testing: ${name}`);
    console.log(`📍 URL: ${url}`);
    
    const feed = await parser.parseURL(url);
    
    console.log(`✅ Success! Found ${feed.items.length} items`);
    
    if (feed.items.length > 0) {
      const firstItem = feed.items[0];
      console.log(`📰 Latest article: "${firstItem.title}"`);
      console.log(`📅 Published: ${firstItem.pubDate}`);
      console.log(`🔗 Link: ${firstItem.link}`);
    }
    
    return { success: true, itemCount: feed.items.length };
  } catch (error) {
    console.error(`❌ Error testing ${name}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testAllFeeds() {
  console.log('🚀 Starting RSS Feed Test...\n');
  
  const results = [];
  
  for (const feed of testFeeds) {
    const result = await testRSSFeed(feed.name, feed.url);
    results.push({
      name: feed.name,
      ...result
    });
    
    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Working feeds:');
    successful.forEach(feed => {
      console.log(`  • ${feed.name} (${feed.itemCount} items)`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed feeds:');
    failed.forEach(feed => {
      console.log(`  • ${feed.name}: ${feed.error}`);
    });
  }
  
  console.log('\n🎯 Test completed!');
}

// Run the test
testAllFeeds().catch(console.error);
