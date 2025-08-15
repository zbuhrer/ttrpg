#!/usr/bin/env node
/**
 * Development Testing Script for Map Features
 * Run with: node scripts/test-maps.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test data for maps
const testMaps = [
  {
    name: "Goblin Cave Entrance",
    width: 15,
    height: 12,
    mapData: {
      cells: {
        "2-5": "wall", "2-6": "wall", "2-7": "wall", "2-8": "wall",
        "3-5": "wall", "3-8": "wall",
        "4-5": "wall", "4-6": "door", "4-7": "door", "4-8": "wall",
        "8-3": "water", "8-4": "water", "9-3": "water", "9-4": "water",
        "10-10": "difficult", "10-11": "difficult", "11-10": "difficult", "11-11": "difficult"
      },
      characters: {}
    }
  },
  {
    name: "Forest Clearing",
    width: 20,
    height: 20,
    mapData: {
      cells: {
        "5-5": "wall", "5-6": "wall", "5-7": "wall",
        "6-5": "wall", "6-7": "wall",
        "7-5": "wall", "7-6": "door", "7-7": "wall",
        "15-15": "water", "15-16": "water", "16-15": "water", "16-16": "water",
        "10-8": "difficult", "10-9": "difficult", "11-8": "difficult", "11-9": "difficult"
      },
      characters: {}
    }
  },
  {
    name: "Dungeon Room",
    width: 25,
    height: 18,
    mapData: {
      cells: {
        // Outer walls
        "0-0": "wall", "0-1": "wall", "0-2": "wall", "0-3": "wall", "0-4": "wall",
        "1-0": "wall", "1-4": "wall",
        "2-0": "wall", "2-2": "door", "2-4": "wall",
        "3-0": "wall", "3-4": "wall",
        "4-0": "wall", "4-1": "wall", "4-2": "wall", "4-3": "wall", "4-4": "wall",
        // Water feature
        "12-8": "water", "12-9": "water", "13-8": "water", "13-9": "water",
        // Pit trap
        "8-12": "pit", "9-12": "pit",
        // Difficult terrain
        "15-5": "difficult", "15-6": "difficult", "16-5": "difficult", "16-6": "difficult"
      },
      characters: {}
    }
  }
];

// API helper functions
async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `http://localhost:3000${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${responseData.message || 'Unknown error'}`);
    }

    return responseData;
  } catch (error) {
    console.error(`❌ Request failed for ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

// Test functions
async function testMapCreation(campaignId) {
  console.log('\n🧪 Testing Map Creation...');

  for (let i = 0; i < testMaps.length; i++) {
    const map = testMaps[i];
    try {
      console.log(`📝 Creating map: "${map.name}"`);
      const createdMap = await makeRequest(`/api/campaigns/${campaignId}/maps`, 'POST', map);
      console.log(`✅ Map created with ID: ${createdMap.id}`);
      testMaps[i].id = createdMap.id; // Store for later tests
    } catch (error) {
      console.error(`❌ Failed to create map: "${map.name}"`);
    }
  }
}

async function testMapRetrieval(campaignId) {
  console.log('\n🧪 Testing Map Retrieval...');

  try {
    console.log('📋 Fetching all maps for campaign');
    const maps = await makeRequest(`/api/campaigns/${campaignId}/maps`);
    console.log(`✅ Retrieved ${maps.length} maps`);

    // Test individual map retrieval
    for (const map of maps.slice(0, 2)) { // Test first 2 maps
      console.log(`📖 Fetching individual map: ${map.name}`);
      const individualMap = await makeRequest(`/api/maps/${map.id}`);
      console.log(`✅ Retrieved map: ${individualMap.name} (${individualMap.width}x${individualMap.height})`);
    }
  } catch (error) {
    console.error('❌ Map retrieval failed');
  }
}

async function testMapUpdates() {
  console.log('\n🧪 Testing Map Updates...');

  if (!testMaps[0].id) {
    console.log('⚠️  No maps to update. Run creation test first.');
    return;
  }

  try {
    const mapId = testMaps[0].id;
    const updatedData = {
      name: "Updated Goblin Cave",
      mapData: {
        ...testMaps[0].mapData,
        cells: {
          ...testMaps[0].mapData.cells,
          "5-5": "wall",
          "5-6": "door",
          "6-5": "wall"
        }
      }
    };

    console.log(`🔄 Updating map ID: ${mapId}`);
    const updatedMap = await makeRequest(`/api/maps/${mapId}`, 'PUT', updatedData);
    console.log(`✅ Map updated: ${updatedMap.name}`);
  } catch (error) {
    console.error('❌ Map update failed');
  }
}

async function testMapDeletion() {
  console.log('\n🧪 Testing Map Deletion...');

  if (testMaps.length === 0 || !testMaps[testMaps.length - 1].id) {
    console.log('⚠️  No maps to delete. Run creation test first.');
    return;
  }

  try {
    const mapId = testMaps[testMaps.length - 1].id;
    console.log(`🗑️  Deleting map ID: ${mapId}`);
    await makeRequest(`/api/maps/${mapId}`, 'DELETE');
    console.log(`✅ Map deleted successfully`);
  } catch (error) {
    console.error('❌ Map deletion failed');
  }
}

async function runPerformanceTest(campaignId) {
  console.log('\n🧪 Testing Performance with Large Maps...');

  const largeMap = {
    name: "Performance Test Map",
    width: 50,
    height: 50,
    mapData: {
      cells: {},
      characters: {}
    }
  };

  // Generate a complex pattern
  for (let row = 0; row < 50; row++) {
    for (let col = 0; col < 50; col++) {
      if (row === 0 || row === 49 || col === 0 || col === 49) {
        largeMap.mapData.cells[`${row}-${col}`] = "wall";
      } else if ((row + col) % 10 === 0) {
        largeMap.mapData.cells[`${row}-${col}`] = "water";
      } else if ((row + col) % 7 === 0) {
        largeMap.mapData.cells[`${row}-${col}`] = "difficult";
      }
    }
  }

  try {
    console.log('⏱️  Creating large map (50x50)...');
    const startTime = Date.now();
    const createdMap = await makeRequest(`/api/campaigns/${campaignId}/maps`, 'POST', largeMap);
    const endTime = Date.now();
    console.log(`✅ Large map created in ${endTime - startTime}ms`);

    // Clean up
    await makeRequest(`/api/maps/${createdMap.id}`, 'DELETE');
    console.log('🧹 Cleaned up performance test map');
  } catch (error) {
    console.error('❌ Performance test failed');
  }
}

async function displayMenu() {
  console.log('\n🗺️  Map System Test Menu');
  console.log('1. Test Map Creation');
  console.log('2. Test Map Retrieval');
  console.log('3. Test Map Updates');
  console.log('4. Test Map Deletion');
  console.log('5. Run Performance Test');
  console.log('6. Run All Tests');
  console.log('7. Exit');
  console.log('\nMake sure your server is running on http://localhost:3000');
}

async function promptForCampaignId() {
  return new Promise((resolve) => {
    rl.question('Enter Campaign ID to test with (default: 1): ', (answer) => {
      resolve(parseInt(answer) || 1);
    });
  });
}

async function promptForChoice() {
  return new Promise((resolve) => {
    rl.question('Enter your choice (1-7): ', (answer) => {
      resolve(parseInt(answer));
    });
  });
}

async function main() {
  console.log('🚀 Map System Testing Script');
  console.log('================================');

  const campaignId = await promptForCampaignId();
  console.log(`Using Campaign ID: ${campaignId}`);

  while (true) {
    await displayMenu();
    const choice = await promptForChoice();

    try {
      switch (choice) {
        case 1:
          await testMapCreation(campaignId);
          break;
        case 2:
          await testMapRetrieval(campaignId);
          break;
        case 3:
          await testMapUpdates();
          break;
        case 4:
          await testMapDeletion();
          break;
        case 5:
          await runPerformanceTest(campaignId);
          break;
        case 6:
          console.log('\n🧪 Running All Tests...');
          await testMapCreation(campaignId);
          await testMapRetrieval(campaignId);
          await testMapUpdates();
          await runPerformanceTest(campaignId);
          console.log('\n✅ All tests completed!');
          break;
        case 7:
          console.log('👋 Goodbye!');
          rl.close();
          process.exit(0);
        default:
          console.log('❌ Invalid choice. Please try again.');
      }
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
    }

    console.log('\nPress Enter to continue...');
    await new Promise(resolve => rl.once('line', resolve));
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Test script terminated');
  rl.close();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  // Check if fetch is available (Node.js 18+)
  if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ or install node-fetch');
    console.log('💡 Alternative: Use curl or Postman for API testing');
    process.exit(1);
  }

  main().catch(console.error);
}

module.exports = {
  testMapCreation,
  testMapRetrieval,
  testMapUpdates,
  testMapDeletion,
  runPerformanceTest
};
