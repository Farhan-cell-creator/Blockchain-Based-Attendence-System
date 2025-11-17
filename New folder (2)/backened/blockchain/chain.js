const fs = require('fs');
const path = require('path');
const Block = require('./block');

class Chain {
  constructor(id, type, storagePath) {
    this.id = id; // e.g., dept-1, class-1-1, student-1-1-1
    this.type = type; // 'department' | 'class' | 'student'
    this.blocks = [];
    this.storagePath = storagePath || path.join(__dirname, '..', 'data', 'chains', `${this.type}-${this.id}.json`);
    // load if exists
    if (fs.existsSync(this.storagePath)) {
      try {
        const raw = fs.readFileSync(this.storagePath, 'utf8');
        const obj = JSON.parse(raw);
        this.blocks = obj.blocks || [];
      } catch (e) {
        console.error('Failed to load chain file', this.storagePath, e.message);
      }
    }
  }

  getLatest() {
    return this.blocks.length ? this.blocks[this.blocks.length - 1] : null;
  }

  addBlock(transactions) {
    const index = this.blocks.length;
    const prev_hash = this.getLatest() ? this.getLatest().hash : (this.genesisPrevHash || '0');
    const block = new Block(index, transactions, prev_hash);
    block.mine('0000');
    this.blocks.push(block);
    this.save();
    return block;
  }

  addGenesis(prevHash) {
    this.genesisPrevHash = prevHash || '0';
    const genesisPayload = { meta: `${this.type} genesis for ${this.id}` };
    return this.addBlock(genesisPayload);
  }

  save() {
    const folder = path.dirname(this.storagePath);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(this.storagePath, JSON.stringify({ id: this.id, type: this.type, blocks: this.blocks }, null, 2));
  }
}

module.exports = Chain;
