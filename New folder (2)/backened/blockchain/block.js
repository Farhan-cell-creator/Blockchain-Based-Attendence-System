const crypto = require('crypto');

class Block {
  constructor(index, transactions, prev_hash = '0') {
    this.index = index;
    this.timestamp = new Date().toISOString();
    this.transactions = transactions; // object or array
    this.prev_hash = prev_hash;
    this.nonce = 0;
    this.hash = this.computeHash();
  }

  computeHash() {
    const data = this.timestamp + JSON.stringify(this.transactions) + this.prev_hash + this.nonce;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  mine(difficultyPrefix = '0000') {
    while (!this.hash.startsWith(difficultyPrefix)) {
      this.nonce += 1;
      this.hash = this.computeHash();
    }
    return this.hash;
  }
}

module.exports = Block;
