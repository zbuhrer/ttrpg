#!/usr/bin/env node
/**
 * Bug Testing Script for Map System
 * Tests the fixes for mouse drawing and map update issues
 * Run with: node scripts/test-map-bugs.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🐛 Map System Bug Testing Script');
console.log('=================================');
console.log('');
console.log('This script helps test the fixes for:');
console.log('Bug 1: Mouse drawing behavior (click/drag issues)');
console.log('Bug 2: Map updates not reflecting in thumbnails');
console.log('');

// Test data for bug reproduction
const testMap = {
  name: "Bug Test Map",
  width: 10,
  height: 10,
  mapData: {
    cells: {
      "2-2": "wall",
      "2-3": "wall",
      "2-4": "wall",
      "3-2": "wall",
      "3-4": "wall",
      "4-2": "wall",
      "4-3": "door",
      "4-4": "wall"
    },
    characters: {}
  }
};

const updatedMapData = {
  name: "Updated Bug Test Map",
  mapData: {
    cells: {
      ...testMap.mapData.cells,
      "5-5": "water",
      "5-6": "water",
      "6-5": "water",
      "6-6": "water",
      "7-7": "difficult",
      "8-8": "pit"
    },
    characters: {}
  }
};

// API helper
async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `http://localhost:3000${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorText);
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Request failed for ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

// Bug 2 Testing: Map Update and Cache Invalidation
async function testMapUpdateBug(campaignId) {
  console.log('\n🧪 Testing Bug 2: Map Update Issue');
  console.log('=====================================');

  let createdMapId = null;

  try {
    // Step 1: Create a test map
    console.log('📝 Step 1: Creating test map...');
    const createdMap = await makeRequest(`/api/campaigns/${campaignId}/maps`, 'POST', testMap);
    createdMapId = createdMap.id;
    console.log(`✅ Created map with ID: ${createdMapId}`);
    console.log('   Original cells:', Object.keys(createdMap.mapData.cells).length);

    // Step 2: Fetch the map to confirm it exists
    console.log('\n📖 Step 2: Fetching created map...');
    const fetchedMap = await makeRequest(`/api/maps/${createdMapId}`);
    console.log(`✅ Fetched map: ${fetchedMap.name}`);
    console.log('   Cells in fetched map:', Object.keys(fetchedMap.mapData.cells).length);

    // Step 3: Update the map with new data
    console.log('\n🔄 Step 3: Updating map with additional cells...');
    const updatedMap = await makeRequest(`/api/maps/${createdMapId}`, 'PUT', updatedMapData);
    console.log(`✅ Updated map: ${updatedMap.name}`);
    console.log('   Cells after update:', Object.keys(updatedMap.mapData.cells).length);

    // Step 4: Verify the update persisted
    console.log('\n🔍 Step 4: Verifying update persistence...');
    const verificationMap = await makeRequest(`/api/maps/${createdMapId}`);
    console.log(`✅ Verification fetch: ${verificationMap.name}`);
    console.log('   Final cell count:', Object.keys(verificationMap.mapData.cells).length);

    // Step 5: Check if the map list reflects changes
    console.log('\n📋 Step 5: Checking map list for changes...');
    const mapList = await makeRequest(`/api/campaigns/${campaignId}/maps`);
    const updatedMapInList = mapList.find(m => m.id === createdMapId);

    if (updatedMapInList) {
      console.log('✅ Map found in list with updated data');
      console.log('   List entry cell count:', Object.keys(updatedMapInList.mapData.cells).length);

      if (Object.keys(updatedMapInList.mapData.cells).length === Object.keys(updatedMapData.mapData.cells).length) {
        console.log('🎉 Bug 2 Test PASSED: Map updates are properly persisted and reflected');
      } else {
        console.log('❌ Bug 2 Test FAILED: Map list not reflecting updates');
      }
    } else {
      console.log('❌ Bug 2 Test FAILED: Updated map not found in list');
    }

  } catch (error) {
    console.error('❌ Bug 2 test failed:', error.message);
  } finally {
    // Cleanup: Delete the test map
    if (createdMapId) {
      try {
        console.log(`\n🧹 Cleaning up test map ${createdMapId}...`);
        await makeRequest(`/api/maps/${createdMapId}`, 'DELETE');
        console.log('✅ Test map deleted');
      } catch (error) {
        console.error('⚠️  Failed to cleanup test map:', error.message);
      }
    }
  }
}

// Manual testing instructions for Bug 1
function displayBug1Instructions() {
  console.log('\n🧪 Testing Bug 1: Mouse Drawing Behavior');
  console.log('==========================================');
  console.log('');
  console.log('🎯 MANUAL TESTING REQUIRED:');
  console.log('');
  console.log('1. Open your browser and go to: http://localhost:5177/maps');
  console.log('2. Create a new map or edit an existing one');
  console.log('3. Test DRAG MODE (default):');
  console.log('   - Select a drawing tool (Wall, Door, etc.)');
  console.log('   - Click and hold mouse button');
  console.log('   - Drag mouse across grid');
  console.log('   - Release mouse button');
  console.log('   - Move mouse WITHOUT pressing button');
  console.log('   ✅ EXPECTED: No drawing should occur when moving mouse');
  console.log('');
  console.log('4. Test CLICK MODE:');
  console.log('   - Switch to "Click" mode in the Drawing Mode section');
  console.log('   - Select a drawing tool');
  console.log('   - Click on a grid cell');
  console.log('   - Move mouse around (without clicking)');
  console.log('   ✅ EXPECTED: No drawing until you click "Stop Drawing"');
  console.log('   - Click on other cells');
  console.log('   ✅ EXPECTED: Should draw on each cell you click');
  console.log('   - Click "Stop Drawing" button');
  console.log('   ✅ EXPECTED: Drawing should stop completely');
  console.log('');
  console.log('5. Edge Cases:');
  console.log('   - Try moving mouse outside the grid while drawing');
  console.log('   - Try switching tools while in click mode');
  console.log('   - Try using undo/redo with both modes');
  console.log('');
  console.log('🎯 SUCCESS CRITERIA:');
  console.log('   ✅ No unintended drawing when mouse moves without button pressed');
  console.log('   ✅ Click mode provides controlled, intentional drawing');
  console.log('   ✅ Mode switching works smoothly');
  console.log('   ✅ Visual indicators show current mode and state');
}

// Performance test for large maps
async function testLargeMapUpdate(campaignId) {
  console.log('\n🧪 Testing Large Map Update Performance');
  console.log('========================================');

  const largeTestMap = {
    name: "Large Performance Test",
    width: 30,
    height: 30,
    mapData: {
      cells: {},
      characters: {}
    }
  };

  // Generate a pattern with many cells
  for (let row = 0; row < 30; row++) {
    for (let col = 0; col < 30; col++) {
      if (row % 3 === 0 && col % 3 === 0) {
        largeTestMap.mapData.cells[`${row}-${col}`] = "wall";
      }
    }
  }

  let mapId = null;

  try {
    console.log('📝 Creating large map (30x30 with pattern)...');
    const startCreate = Date.now();
    const createdMap = await makeRequest(`/api/campaigns/${campaignId}/maps`, 'POST', largeTestMap);
    const createTime = Date.now() - startCreate;
    mapId = createdMap.id;
    console.log(`✅ Created large map in ${createTime}ms`);

    // Add more cells to test update
    const additionalCells = {};
    for (let i = 0; i < 50; i++) {
      additionalCells[`${Math.floor(Math.random() * 30)}-${Math.floor(Math.random() * 30)}`] = "water";
    }

    const updateData = {
      mapData: {
        cells: { ...largeTestMap.mapData.cells, ...additionalCells },
        characters: {}
      }
    };

    console.log('🔄 Updating large map with additional cells...');
    const startUpdate = Date.now();
    await makeRequest(`/api/maps/${mapId}`, 'PUT', updateData);
    const updateTime = Date.now() - startUpdate;
    console.log(`✅ Updated large map in ${updateTime}ms`);

    if (updateTime > 2000) {
      console.log('⚠️  Large map update took over 2 seconds - consider optimization');
    } else {
      console.log('🎉 Large map update performance is acceptable');
    }

  } catch (error) {
    console.error('❌ Large map test failed:', error.message);
  } finally {
    if (mapId) {
      try {
        await makeRequest(`/api/maps/${mapId}`, 'DELETE');
        console.log('🧹 Large test map cleaned up');
      } catch (error) {
        console.error('⚠️  Failed to cleanup large map:', error.message);
      }
    }
  }
}

// Main menu
async function showMenu() {
  console.log('\n🛠️  Bug Testing Menu');
  console.log('===================');
  console.log('1. Test Bug 2: Map Update & Cache Issues');
  console.log('2. Show Bug 1: Mouse Drawing Test Instructions');
  console.log('3. Test Large Map Performance');
  console.log('4. Run API Status Check');
  console.log('5. Exit');
}

async function promptForChoice() {
  return new Promise((resolve) => {
    rl.question('Enter your choice (1-5): ', (answer) => {
      resolve(parseInt(answer));
    });
  });
}

async function promptForCampaignId() {
  return new Promise((resolve) => {
    rl.question('Enter Campaign ID for testing (default: 1): ', (answer) => {
      resolve(parseInt(answer) || 1);
    });
  });
}

async function checkAPIStatus() {
  console.log('\n🔍 Checking API Status...');

  try {
    // Test if server is running
    const response = await fetch('http://localhost:3000/api/campaigns/1/maps');
    if (response.ok) {
      console.log('✅ API server is running and responsive');
    } else {
      console.log(`⚠️  API server returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ API server is not accessible. Make sure it\'s running on http://localhost:3000');
    console.log('   Start server with: npm run dev');
  }
}

async function main() {
  // Check Node.js version
  if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ for fetch API');
    process.exit(1);
  }

  await checkAPIStatus();

  const campaignId = await promptForCampaignId();
  console.log(`Using Campaign ID: ${campaignId}`);

  while (true) {
    await showMenu();
    const choice = await promptForChoice();

    try {
      switch (choice) {
        case 1:
          await testMapUpdateBug(campaignId);
          break;
        case 2:
          displayBug1Instructions();
          break;
        case 3:
          await testLargeMapUpdate(campaignId);
          break;
        case 4:
          await checkAPIStatus();
          break;
        case 5:
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
  console.log('\n👋 Bug testing script terminated');
  rl.close();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testMapUpdateBug, testLargeMapUpdate };
