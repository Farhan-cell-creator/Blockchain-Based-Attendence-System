const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeHashForBlock(block) {
  const data = block.timestamp + JSON.stringify(block.transactions) + block.prev_hash + block.nonce;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function isValidChain(blocks, expectedGenesisPrev = null) {
  if (!Array.isArray(blocks) || blocks.length === 0) return false;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const recomputed = computeHashForBlock(block);
    if (recomputed !== block.hash) return false;
    if (!block.hash.startsWith('0000')) return false;
    if (i === 0 && expectedGenesisPrev !== null) {
      if (block.prev_hash !== expectedGenesisPrev) return false;
    }
    if (i > 0) {
      if (block.prev_hash !== blocks[i - 1].hash) return false;
    }
  }
  return true;
}

module.exports = { computeHashForBlock, isValidChain };
