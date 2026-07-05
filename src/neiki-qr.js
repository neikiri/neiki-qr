/*!
 * Neiki's QR 1.0.0
 * A lightweight, dependency-free QR Code Generator & Scanner Web Component.
 * https://github.com/neikiri/neiki-qr
 * MIT License
 */
(function () {
  'use strict';

  if (typeof window !== 'undefined' && window.customElements && customElements.get('neiki-qr')) {
    return;
  }

  // =======================================================================
  // QR Code encoder (ISO/IEC 18004) — Byte mode, versions 1-40, all ECC levels
  // =======================================================================

  var EC_INDICATOR_BITS = { L: 0x01, M: 0x00, Q: 0x03, H: 0x02 };
  var EC_ORDER = { L: 0, M: 1, Q: 2, H: 3 };

  var RS_BLOCK_TABLE = [
    [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
    [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
    [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
    [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
    [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
    [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
    [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
    [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],
    [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],
    [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],
    [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13],
    [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15],
    [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12],
    [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13],
    [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12, 7, 37, 13],
    [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16],
    [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15],
    [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15],
    [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14],
    [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16],
    [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17],
    [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13],
    [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16],
    [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17],
    [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16],
    [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17],
    [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16],
    [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16],
    [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16],
    [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16],
    [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16],
    [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16],
    [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16],
    [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17],
    [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16],
    [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16],
    [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16],
    [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16],
    [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16],
    [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]
  ];

  var ALIGNMENT_POSITIONS = [
    [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
    [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62],
    [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90],
    [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]
  ];

  function charCountBits(version) {
    return version < 10 ? 8 : 16;
  }

  function getRSBlocksExpanded(version, eccLevel) {
    var idx = (version - 1) * 4 + EC_ORDER[eccLevel];
    var row = RS_BLOCK_TABLE[idx];
    var blocks = [];
    var n1 = row[0], total1 = row[1], data1 = row[2];
    for (var i = 0; i < n1; i++) blocks.push({ total: total1, data: data1 });
    if (row.length > 3) {
      var n2 = row[3], total2 = row[4], data2 = row[5];
      for (var j = 0; j < n2; j++) blocks.push({ total: total2, data: data2 });
    }
    return blocks;
  }

  function BitBuffer() {
    this.bytes = [];
    this.bitLength = 0;
  }
  BitBuffer.prototype.putBit = function (bit) {
    var byteIndex = Math.floor(this.bitLength / 8);
    if (this.bytes.length <= byteIndex) this.bytes.push(0);
    if (bit) this.bytes[byteIndex] |= (0x80 >>> (this.bitLength % 8));
    this.bitLength++;
  };
  BitBuffer.prototype.put = function (num, length) {
    for (var i = length - 1; i >= 0; i--) this.putBit(((num >>> i) & 1) === 1);
  };

  var GF_EXP = new Array(512);
  var GF_LOG = new Array(256);
  (function initGF() {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11D;
    }
    for (i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  function generatorPolynomial(degree) {
    var poly = [1];
    for (var i = 0; i < degree; i++) {
      var next = new Array(poly.length + 1).fill(0);
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= gfMul(poly[j], 1);
        next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
      }
      poly = next;
    }
    return poly;
  }

  function computeECCodewords(dataBytes, ecCount) {
    var generator = generatorPolynomial(ecCount);
    var result = dataBytes.slice();
    for (var i = 0; i < ecCount; i++) result.push(0);
    for (i = 0; i < dataBytes.length; i++) {
      var coef = result[i];
      if (coef !== 0) {
        for (var j = 0; j < generator.length; j++) result[i + j] ^= gfMul(generator[j], coef);
      }
    }
    return result.slice(dataBytes.length);
  }

  function bchDigit(data) {
    var digit = 0;
    while (data !== 0) { digit++; data >>>= 1; }
    return digit;
  }
  var G15 = 0x537;
  var G15_DIGIT = bchDigit(G15);
  var G18 = 0x1F25;
  var G18_DIGIT = bchDigit(G18);
  var FORMAT_MASK = 0x5412;

  function bchEncode(data, generator, generatorDigit) {
    var d = data << (generatorDigit - 1);
    while (bchDigit(d) >= generatorDigit) d ^= (generator << (bchDigit(d) - generatorDigit));
    return d;
  }

  function formatInfoBits(eccLevel, maskPattern) {
    var data = (EC_INDICATOR_BITS[eccLevel] << 3) | maskPattern;
    var bch = bchEncode(data, G15, G15_DIGIT);
    var full = (data << 10) | bch;
    return full ^ FORMAT_MASK;
  }

  function versionInfoBits(version) {
    var bch = bchEncode(version, G18, G18_DIGIT);
    return (version << 12) | bch;
  }

  function totalDataCodewords(version, eccLevel) {
    var blocks = getRSBlocksExpanded(version, eccLevel);
    var sum = 0;
    for (var i = 0; i < blocks.length; i++) sum += blocks[i].data;
    return sum;
  }

  function chooseVersion(byteLength, eccLevel, minVersion, maxVersion) {
    for (var v = minVersion; v <= maxVersion; v++) {
      var capacityBits = totalDataCodewords(v, eccLevel) * 8;
      var neededBits = 4 + charCountBits(v) + byteLength * 8;
      if (neededBits <= capacityBits) return v;
    }
    return -1;
  }

  function buildDataBits(bytes, version, eccLevel) {
    var buf = new BitBuffer();
    buf.put(0x4, 4);
    buf.put(bytes.length, charCountBits(version));
    for (var i = 0; i < bytes.length; i++) buf.put(bytes[i], 8);

    var totalBits = totalDataCodewords(version, eccLevel) * 8;
    var termBits = Math.min(4, totalBits - buf.bitLength);
    if (termBits > 0) buf.put(0, termBits);
    while (buf.bitLength % 8 !== 0) buf.putBit(false);

    var padAlt = [0xEC, 0x11];
    var padIdx = 0;
    while (buf.bitLength < totalBits) {
      buf.put(padAlt[padIdx % 2], 8);
      padIdx++;
    }
    return buf.bytes;
  }

  function interleave(dataCodewords, version, eccLevel) {
    var blocks = getRSBlocksExpanded(version, eccLevel);
    var offset = 0;
    var blockData = [], blockEc = [];
    var maxData = 0, maxEc = 0;
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var data = dataCodewords.slice(offset, offset + b.data);
      offset += b.data;
      var ecCount = b.total - b.data;
      var ec = computeECCodewords(data, ecCount);
      blockData.push(data);
      blockEc.push(ec);
      maxData = Math.max(maxData, data.length);
      maxEc = Math.max(maxEc, ec.length);
    }
    var result = [];
    for (i = 0; i < maxData; i++) {
      for (var b2 = 0; b2 < blockData.length; b2++) if (i < blockData[b2].length) result.push(blockData[b2][i]);
    }
    for (i = 0; i < maxEc; i++) {
      for (b2 = 0; b2 < blockEc.length; b2++) if (i < blockEc[b2].length) result.push(blockEc[b2][i]);
    }
    return result;
  }

  function createMatrix(version) {
    var size = version * 4 + 17;
    var modules = [], isFunction = [];
    for (var r = 0; r < size; r++) {
      modules.push(new Array(size).fill(false));
      isFunction.push(new Array(size).fill(false));
    }
    return { size: size, modules: modules, isFunction: isFunction, version: version };
  }

  function setModule(m, row, col, value, fn) {
    if (row < 0 || row >= m.size || col < 0 || col >= m.size) return;
    m.modules[row][col] = value;
    if (fn) m.isFunction[row][col] = true;
  }

  function placeFinderPattern(m, row, col) {
    for (var r = -1; r <= 7; r++) {
      for (var c = -1; c <= 7; c++) {
        var rr = row + r, cc = col + c;
        if (rr < 0 || rr >= m.size || cc < 0 || cc >= m.size) continue;
        var dark = (r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)));
        setModule(m, rr, cc, dark, true);
      }
    }
  }

  function placeAlignmentPattern(m, row, col) {
    for (var r = -2; r <= 2; r++) {
      for (var c = -2; c <= 2; c++) {
        var dark = (Math.max(Math.abs(r), Math.abs(c)) !== 1);
        setModule(m, row + r, col + c, dark, true);
      }
    }
  }

  function placeFunctionPatterns(m) {
    var size = m.size, version = m.version, i;
    placeFinderPattern(m, 0, 0);
    placeFinderPattern(m, 0, size - 7);
    placeFinderPattern(m, size - 7, 0);

    for (i = 8; i < size - 8; i++) {
      var dark = (i % 2 === 0);
      setModule(m, 6, i, dark, true);
      setModule(m, i, 6, dark, true);
    }

    var positions = ALIGNMENT_POSITIONS[version - 1] || [];
    for (var pi = 0; pi < positions.length; pi++) {
      for (var pj = 0; pj < positions.length; pj++) {
        var r = positions[pi], c = positions[pj];
        if ((r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8)) continue;
        placeAlignmentPattern(m, r, c);
      }
    }

    for (i = 0; i < 9; i++) {
      if (i !== 6) setModule(m, 8, i, false, true);
      if (i !== 6) setModule(m, i, 8, false, true);
    }
    setModule(m, 8, 8, false, true);
    for (i = 0; i < 8; i++) {
      setModule(m, 8, size - 1 - i, false, true);
      setModule(m, size - 1 - i, 8, false, true);
    }

    if (version >= 7) {
      for (var a = 0; a < 6; a++) {
        for (var b = 0; b < 3; b++) {
          setModule(m, size - 11 + b, a, false, true);
          setModule(m, a, size - 11 + b, false, true);
        }
      }
    }

    // dark module (placed last so it is not overwritten by the format-info reservation strip)
    setModule(m, size - 8, 8, true, true);
  }

  function placeData(m, codewords) {
    var size = m.size;
    var bits = [];
    for (var i = 0; i < codewords.length; i++) {
      for (var b = 7; b >= 0; b--) bits.push(((codewords[i] >>> b) & 1) === 1);
    }
    var bitIndex = 0;
    var upward = true;
    for (var col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      for (var count = 0; count < size; count++) {
        var row = upward ? (size - 1 - count) : count;
        for (var cOff = 0; cOff < 2; cOff++) {
          var c = col - cOff;
          if (m.isFunction[row][c]) continue;
          var bit = bitIndex < bits.length ? bits[bitIndex] : false;
          bitIndex++;
          m.modules[row][c] = bit;
        }
      }
      upward = !upward;
    }
  }

  var MASK_FUNCTIONS = [
    function (r, c) { return (r + c) % 2 === 0; },
    function (r, c) { return r % 2 === 0; },
    function (r, c) { return c % 3 === 0; },
    function (r, c) { return (r + c) % 3 === 0; },
    function (r, c) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; },
    function (r, c) { return ((r * c) % 2) + ((r * c) % 3) === 0; },
    function (r, c) { return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; },
    function (r, c) { return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0; }
  ];

  function applyMask(m, maskIndex) {
    var maskFn = MASK_FUNCTIONS[maskIndex];
    var out = [];
    for (var r = 0; r < m.size; r++) {
      out.push(m.modules[r].slice());
      for (var c = 0; c < m.size; c++) {
        if (!m.isFunction[r][c] && maskFn(r, c)) out[r][c] = !out[r][c];
      }
    }
    return out;
  }

  function computePenalty(modules, size) {
    var penalty = 0;

    function runPenalty(getVal) {
      var p = 0;
      for (var i = 0; i < size; i++) {
        var runColor = null, runLen = 0;
        for (var j = 0; j < size; j++) {
          var v = getVal(i, j);
          if (v === runColor) {
            runLen++;
          } else {
            if (runLen >= 5) p += runLen - 2;
            runColor = v;
            runLen = 1;
          }
        }
        if (runLen >= 5) p += runLen - 2;
      }
      return p;
    }
    penalty += runPenalty(function (r, c) { return modules[r][c]; });
    penalty += runPenalty(function (r, c) { return modules[c][r]; });

    var r, c;
    for (r = 0; r < size - 1; r++) {
      for (c = 0; c < size - 1; c++) {
        var v = modules[r][c];
        if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) penalty += 3;
      }
    }

    var patternA = [true, false, true, true, true, false, true, false, false, false, false];
    var patternB = [false, false, false, false, true, false, true, true, true, false, true];
    function matchesPattern(arr, pattern) {
      for (var i = 0; i < pattern.length; i++) if (arr[i] !== pattern[i]) return false;
      return true;
    }
    for (r = 0; r < size; r++) {
      for (c = 0; c <= size - 11; c++) {
        var rowSlice = [];
        for (var k = 0; k < 11; k++) rowSlice.push(modules[r][c + k]);
        if (matchesPattern(rowSlice, patternA) || matchesPattern(rowSlice, patternB)) penalty += 40;
      }
    }
    for (c = 0; c < size; c++) {
      for (r = 0; r <= size - 11; r++) {
        var colSlice = [];
        for (var k2 = 0; k2 < 11; k2++) colSlice.push(modules[r + k2][c]);
        if (matchesPattern(colSlice, patternA) || matchesPattern(colSlice, patternB)) penalty += 40;
      }
    }

    var dark = 0;
    for (r = 0; r < size; r++) for (c = 0; c < size; c++) if (modules[r][c]) dark++;
    var percent = (dark * 100) / (size * size);
    penalty += Math.floor(Math.abs(percent - 50) / 5) * 10;

    return penalty;
  }

  function placeFormatInfo(m, eccLevel, maskPattern) {
    var bits = formatInfoBits(eccLevel, maskPattern);
    var size = m.size;
    function bitAt(i) { return ((bits >>> i) & 1) === 1; }

    for (var i = 0; i <= 5; i++) setModule(m, i, 8, bitAt(i), true);
    setModule(m, 7, 8, bitAt(6), true);
    setModule(m, 8, 8, bitAt(7), true);
    setModule(m, 8, 7, bitAt(8), true);
    for (i = 9; i <= 14; i++) setModule(m, 8, 14 - i, bitAt(i), true);

    for (i = 0; i <= 7; i++) setModule(m, 8, size - 1 - i, bitAt(i), true);
    for (i = 8; i <= 14; i++) setModule(m, size - 15 + i, 8, bitAt(i), true);
  }

  function placeVersionInfo(m) {
    var version = m.version;
    if (version < 7) return;
    var bits = versionInfoBits(version);
    var size = m.size;
    for (var i = 0; i < 18; i++) {
      var bit = ((bits >>> i) & 1) === 1;
      var row = Math.floor(i / 3);
      var col = (i % 3) + size - 11;
      setModule(m, row, col, bit, true);
      setModule(m, col, row, bit, true);
    }
  }

  function utf8Bytes(text) {
    if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(text));
    var bytes = [];
    var escaped = unescape(encodeURIComponent(text));
    for (var i = 0; i < escaped.length; i++) bytes.push(escaped.charCodeAt(i));
    return bytes;
  }

  function qrEncode(text, options) {
    options = options || {};
    var eccLevel = options.eccLevel || 'M';
    var minVersion = options.minVersion || 1;
    var maxVersion = options.maxVersion || 40;

    var bytes = utf8Bytes(text == null ? '' : String(text));
    var version = chooseVersion(bytes.length, eccLevel, minVersion, maxVersion);
    if (version === -1) throw new Error('QR_DATA_TOO_LONG');

    var dataCodewords = buildDataBits(bytes, version, eccLevel);
    var finalCodewords = interleave(dataCodewords, version, eccLevel);

    var base = createMatrix(version);
    placeFunctionPatterns(base);
    placeData(base, finalCodewords);

    var bestMask = 0, bestPenalty = Infinity, bestModules = null;
    for (var mi = 0; mi < 8; mi++) {
      var candidate = applyMask(base, mi);
      var penalty = computePenalty(candidate, base.size);
      if (penalty < bestPenalty) {
        bestPenalty = penalty;
        bestMask = mi;
        bestModules = candidate;
      }
    }

    base.modules = bestModules;
    placeFormatInfo(base, eccLevel, bestMask);
    placeVersionInfo(base);

    return { version: version, eccLevel: eccLevel, maskPattern: bestMask, size: base.size, modules: base.modules };
  }

  var QR = { encode: qrEncode };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = QR;
  }

  if (typeof window === 'undefined' || !window.customElements) {
    return;
  }

  // =======================================================================
  // i18n
  // =======================================================================

  var TRANSLATIONS = {
    en: {
      mode: { generate: 'Generate', scan: 'Scan' },
      type: {
        text: 'Text', url: 'URL', wifi: 'Wi-Fi', email: 'Email', tel: 'Phone', sms: 'SMS', whatsapp: 'WhatsApp',
        vcard: 'Contact (vCard)', event: 'Event', geo: 'Location', sepa: 'SEPA Payment', czqr: 'Czech QR Payment', bitcoin: 'Bitcoin'
      },
      field: {
        text: 'Text', url: 'Web address', ssid: 'Network name (SSID)', password: 'Password', encryption: 'Encryption', hidden: 'Hidden network',
        to: 'To', subject: 'Subject', body: 'Message', number: 'Phone number', message: 'Message',
        firstName: 'First name', lastName: 'Last name', phone: 'Phone', email: 'Email', org: 'Organization', title: 'Job title', address: 'Address',
        eventTitle: 'Title', location: 'Location', start: 'Starts', end: 'Ends', description: 'Description',
        lat: 'Latitude', lon: 'Longitude',
        name: 'Beneficiary name', iban: 'IBAN', bic: 'BIC (optional)', amount: 'Amount', currency: 'Currency', reference: 'Reference',
        account: 'IBAN', variableSymbol: 'Variable symbol', specificSymbol: 'Specific symbol', constantSymbol: 'Constant symbol',
        address_btc: 'Bitcoin address', label: 'Label'
      },
      enc: { wpa: 'WPA/WPA2', wep: 'WEP', nopass: 'None' },
      toolbar: { type: 'Type', ecc: 'Error correction', size: 'Size', download: 'Download', downloadPng: 'Download PNG', downloadSvg: 'Download SVG', copy: 'Copy content', copied: 'Copied!' },
      ecc: { L: 'Low (7%)', M: 'Medium (15%)', Q: 'Quartile (25%)', H: 'High (30%)' },
      scan: {
        start: 'Start camera', stop: 'Stop camera', upload: 'Upload image', switchCamera: 'Switch camera', torch: 'Flashlight',
        history: 'Scan history', clear: 'Clear', openLink: 'Open', copy: 'Copy', copied: 'Copied!', empty: 'No codes scanned yet',
        noSupport: 'Your browser does not support live barcode scanning. Try Chrome or Edge, or upload an image instead.',
        permissionDenied: 'Camera access was denied. Allow camera access to scan.', notFound: 'No code was found in the selected image.',
        scanning: 'Scanning…', found: 'Code detected'
      },
      misc: { placeholder: 'Enter a value to generate a QR code', dataTooLong: 'This data is too long to fit in a QR code' }
    },
    cs: {
      mode: { generate: 'Generovat', scan: 'Skenovat' },
      type: {
        text: 'Text', url: 'URL', wifi: 'Wi-Fi', email: 'E-mail', tel: 'Telefon', sms: 'SMS', whatsapp: 'WhatsApp',
        vcard: 'Kontakt (vCard)', event: 'Událost', geo: 'Poloha', sepa: 'SEPA platba', czqr: 'Česká QR platba', bitcoin: 'Bitcoin'
      },
      field: {
        text: 'Text', url: 'Webová adresa', ssid: 'Název sítě (SSID)', password: 'Heslo', encryption: 'Šifrování', hidden: 'Skrytá síť',
        to: 'Komu', subject: 'Předmět', body: 'Zpráva', number: 'Telefonní číslo', message: 'Zpráva',
        firstName: 'Jméno', lastName: 'Příjmení', phone: 'Telefon', email: 'E-mail', org: 'Organizace', title: 'Pozice', address: 'Adresa',
        eventTitle: 'Název', location: 'Místo', start: 'Začátek', end: 'Konec', description: 'Popis',
        lat: 'Zeměpisná šířka', lon: 'Zeměpisná délka',
        name: 'Jméno příjemce', iban: 'IBAN', bic: 'BIC (volitelné)', amount: 'Částka', currency: 'Měna', reference: 'Reference',
        account: 'IBAN', variableSymbol: 'Variabilní symbol', specificSymbol: 'Specifický symbol', constantSymbol: 'Konstantní symbol',
        address_btc: 'Bitcoinová adresa', label: 'Popisek'
      },
      enc: { wpa: 'WPA/WPA2', wep: 'WEP', nopass: 'Žádné' },
      toolbar: { type: 'Typ', ecc: 'Oprava chyb', size: 'Velikost', download: 'Stáhnout', downloadPng: 'Stáhnout PNG', downloadSvg: 'Stáhnout SVG', copy: 'Kopírovat obsah', copied: 'Zkopírováno!' },
      ecc: { L: 'Nízká (7 %)', M: 'Střední (15 %)', Q: 'Kvartilní (25 %)', H: 'Vysoká (30 %)' },
      scan: {
        start: 'Spustit kameru', stop: 'Zastavit kameru', upload: 'Nahrát obrázek', switchCamera: 'Přepnout kameru', torch: 'Svítilna',
        history: 'Historie skenování', clear: 'Vymazat', openLink: 'Otevřít', copy: 'Kopírovat', copied: 'Zkopírováno!', empty: 'Zatím žádné naskenované kódy',
        noSupport: 'Váš prohlížeč nepodporuje živé skenování kódů. Zkuste Chrome nebo Edge, případně nahrajte obrázek.',
        permissionDenied: 'Přístup ke kameře byl odepřen. Pro skenování povolte přístup ke kameře.', notFound: 'Ve vybraném obrázku nebyl nalezen žádný kód.',
        scanning: 'Skenuji…', found: 'Kód nalezen'
      },
      misc: { placeholder: 'Zadejte hodnotu pro vygenerování QR kódu', dataTooLong: 'Tato data jsou příliš dlouhá na to, aby se vešla do QR kódu' }
    },
    de: {
      mode: { generate: 'Erstellen', scan: 'Scannen' },
      type: {
        text: 'Text', url: 'URL', wifi: 'WLAN', email: 'E-Mail', tel: 'Telefon', sms: 'SMS', whatsapp: 'WhatsApp',
        vcard: 'Kontakt (vCard)', event: 'Termin', geo: 'Standort', sepa: 'SEPA-Zahlung', czqr: 'Tschechische QR-Zahlung', bitcoin: 'Bitcoin'
      },
      field: {
        text: 'Text', url: 'Webadresse', ssid: 'Netzwerkname (SSID)', password: 'Passwort', encryption: 'Verschlüsselung', hidden: 'Verstecktes Netzwerk',
        to: 'An', subject: 'Betreff', body: 'Nachricht', number: 'Telefonnummer', message: 'Nachricht',
        firstName: 'Vorname', lastName: 'Nachname', phone: 'Telefon', email: 'E-Mail', org: 'Organisation', title: 'Position', address: 'Adresse',
        eventTitle: 'Titel', location: 'Ort', start: 'Beginn', end: 'Ende', description: 'Beschreibung',
        lat: 'Breitengrad', lon: 'Längengrad',
        name: 'Empfängername', iban: 'IBAN', bic: 'BIC (optional)', amount: 'Betrag', currency: 'Währung', reference: 'Referenz',
        account: 'IBAN', variableSymbol: 'Variabler Symbol', specificSymbol: 'Spezifisches Symbol', constantSymbol: 'Konstantes Symbol',
        address_btc: 'Bitcoin-Adresse', label: 'Bezeichnung'
      },
      enc: { wpa: 'WPA/WPA2', wep: 'WEP', nopass: 'Keine' },
      toolbar: { type: 'Typ', ecc: 'Fehlerkorrektur', size: 'Größe', download: 'Herunterladen', downloadPng: 'PNG herunterladen', downloadSvg: 'SVG herunterladen', copy: 'Inhalt kopieren', copied: 'Kopiert!' },
      ecc: { L: 'Niedrig (7 %)', M: 'Mittel (15 %)', Q: 'Quartil (25 %)', H: 'Hoch (30 %)' },
      scan: {
        start: 'Kamera starten', stop: 'Kamera stoppen', upload: 'Bild hochladen', switchCamera: 'Kamera wechseln', torch: 'Taschenlampe',
        history: 'Scan-Verlauf', clear: 'Löschen', openLink: 'Öffnen', copy: 'Kopieren', copied: 'Kopiert!', empty: 'Noch keine Codes gescannt',
        noSupport: 'Ihr Browser unterstützt kein Live-Scannen. Nutzen Sie Chrome oder Edge, oder laden Sie ein Bild hoch.',
        permissionDenied: 'Kamerazugriff wurde verweigert. Erlauben Sie den Zugriff zum Scannen.', notFound: 'Im ausgewählten Bild wurde kein Code gefunden.',
        scanning: 'Scanne…', found: 'Code erkannt'
      },
      misc: { placeholder: 'Geben Sie einen Wert ein, um einen QR-Code zu erstellen', dataTooLong: 'Diese Daten sind zu lang für einen QR-Code' }
    },
    es: {
      mode: { generate: 'Generar', scan: 'Escanear' },
      type: {
        text: 'Texto', url: 'URL', wifi: 'Wi-Fi', email: 'Correo', tel: 'Teléfono', sms: 'SMS', whatsapp: 'WhatsApp',
        vcard: 'Contacto (vCard)', event: 'Evento', geo: 'Ubicación', sepa: 'Pago SEPA', czqr: 'Pago QR checo', bitcoin: 'Bitcoin'
      },
      field: {
        text: 'Texto', url: 'Dirección web', ssid: 'Nombre de red (SSID)', password: 'Contraseña', encryption: 'Cifrado', hidden: 'Red oculta',
        to: 'Para', subject: 'Asunto', body: 'Mensaje', number: 'Número de teléfono', message: 'Mensaje',
        firstName: 'Nombre', lastName: 'Apellido', phone: 'Teléfono', email: 'Correo', org: 'Organización', title: 'Puesto', address: 'Dirección',
        eventTitle: 'Título', location: 'Ubicación', start: 'Inicio', end: 'Fin', description: 'Descripción',
        lat: 'Latitud', lon: 'Longitud',
        name: 'Nombre del beneficiario', iban: 'IBAN', bic: 'BIC (opcional)', amount: 'Importe', currency: 'Moneda', reference: 'Referencia',
        account: 'IBAN', variableSymbol: 'Símbolo variable', specificSymbol: 'Símbolo específico', constantSymbol: 'Símbolo constante',
        address_btc: 'Dirección de Bitcoin', label: 'Etiqueta'
      },
      enc: { wpa: 'WPA/WPA2', wep: 'WEP', nopass: 'Ninguno' },
      toolbar: { type: 'Tipo', ecc: 'Corrección de errores', size: 'Tamaño', download: 'Descargar', downloadPng: 'Descargar PNG', downloadSvg: 'Descargar SVG', copy: 'Copiar contenido', copied: '¡Copiado!' },
      ecc: { L: 'Baja (7 %)', M: 'Media (15 %)', Q: 'Cuartil (25 %)', H: 'Alta (30 %)' },
      scan: {
        start: 'Iniciar cámara', stop: 'Detener cámara', upload: 'Subir imagen', switchCamera: 'Cambiar cámara', torch: 'Linterna',
        history: 'Historial de escaneo', clear: 'Borrar', openLink: 'Abrir', copy: 'Copiar', copied: '¡Copiado!', empty: 'Aún no hay códigos escaneados',
        noSupport: 'Tu navegador no admite el escaneo en vivo. Prueba Chrome o Edge, o sube una imagen.',
        permissionDenied: 'Se denegó el acceso a la cámara. Permite el acceso para escanear.', notFound: 'No se encontró ningún código en la imagen seleccionada.',
        scanning: 'Escaneando…', found: 'Código detectado'
      },
      misc: { placeholder: 'Introduce un valor para generar un código QR', dataTooLong: 'Estos datos son demasiado largos para un código QR' }
    },
    fr: {
      mode: { generate: 'Générer', scan: 'Scanner' },
      type: {
        text: 'Texte', url: 'URL', wifi: 'Wi-Fi', email: 'E-mail', tel: 'Téléphone', sms: 'SMS', whatsapp: 'WhatsApp',
        vcard: 'Contact (vCard)', event: 'Événement', geo: 'Position', sepa: 'Paiement SEPA', czqr: 'Paiement QR tchèque', bitcoin: 'Bitcoin'
      },
      field: {
        text: 'Texte', url: 'Adresse web', ssid: 'Nom du réseau (SSID)', password: 'Mot de passe', encryption: 'Chiffrement', hidden: 'Réseau masqué',
        to: 'À', subject: 'Objet', body: 'Message', number: 'Numéro de téléphone', message: 'Message',
        firstName: 'Prénom', lastName: 'Nom', phone: 'Téléphone', email: 'E-mail', org: 'Organisation', title: 'Poste', address: 'Adresse',
        eventTitle: 'Titre', location: 'Lieu', start: 'Début', end: 'Fin', description: 'Description',
        lat: 'Latitude', lon: 'Longitude',
        name: 'Nom du bénéficiaire', iban: 'IBAN', bic: 'BIC (facultatif)', amount: 'Montant', currency: 'Devise', reference: 'Référence',
        account: 'IBAN', variableSymbol: 'Symbole variable', specificSymbol: 'Symbole spécifique', constantSymbol: 'Symbole constant',
        address_btc: 'Adresse Bitcoin', label: 'Libellé'
      },
      enc: { wpa: 'WPA/WPA2', wep: 'WEP', nopass: 'Aucun' },
      toolbar: { type: 'Type', ecc: "Correction d'erreurs", size: 'Taille', download: 'Télécharger', downloadPng: 'Télécharger le PNG', downloadSvg: 'Télécharger le SVG', copy: 'Copier le contenu', copied: 'Copié !' },
      ecc: { L: 'Faible (7 %)', M: 'Moyenne (15 %)', Q: 'Quartile (25 %)', H: 'Élevée (30 %)' },
      scan: {
        start: 'Démarrer la caméra', stop: 'Arrêter la caméra', upload: 'Importer une image', switchCamera: 'Changer de caméra', torch: 'Lampe torche',
        history: 'Historique des scans', clear: 'Effacer', openLink: 'Ouvrir', copy: 'Copier', copied: 'Copié !', empty: 'Aucun code scanné pour le moment',
        noSupport: "Votre navigateur ne prend pas en charge la lecture en direct. Essayez Chrome ou Edge, ou importez une image.",
        permissionDenied: "L'accès à la caméra a été refusé. Autorisez l'accès pour scanner.", notFound: "Aucun code n'a été trouvé dans l'image sélectionnée.",
        scanning: 'Analyse en cours…', found: 'Code détecté'
      },
      misc: { placeholder: 'Saisissez une valeur pour générer un code QR', dataTooLong: 'Ces données sont trop longues pour un code QR' }
    },
    pl: {
      mode: { generate: 'Generuj', scan: 'Skanuj' },
      type: {
        text: 'Tekst', url: 'URL', wifi: 'Wi-Fi', email: 'E-mail', tel: 'Telefon', sms: 'SMS', whatsapp: 'WhatsApp',
        vcard: 'Kontakt (vCard)', event: 'Wydarzenie', geo: 'Lokalizacja', sepa: 'Płatność SEPA', czqr: 'Czeska płatność QR', bitcoin: 'Bitcoin'
      },
      field: {
        text: 'Tekst', url: 'Adres WWW', ssid: 'Nazwa sieci (SSID)', password: 'Hasło', encryption: 'Szyfrowanie', hidden: 'Ukryta sieć',
        to: 'Do', subject: 'Temat', body: 'Wiadomość', number: 'Numer telefonu', message: 'Wiadomość',
        firstName: 'Imię', lastName: 'Nazwisko', phone: 'Telefon', email: 'E-mail', org: 'Organizacja', title: 'Stanowisko', address: 'Adres',
        eventTitle: 'Tytuł', location: 'Miejsce', start: 'Początek', end: 'Koniec', description: 'Opis',
        lat: 'Szerokość geogr.', lon: 'Długość geogr.',
        name: 'Nazwa odbiorcy', iban: 'IBAN', bic: 'BIC (opcjonalnie)', amount: 'Kwota', currency: 'Waluta', reference: 'Referencja',
        account: 'IBAN', variableSymbol: 'Symbol zmienny', specificSymbol: 'Symbol specyficzny', constantSymbol: 'Symbol stały',
        address_btc: 'Adres Bitcoin', label: 'Etykieta'
      },
      enc: { wpa: 'WPA/WPA2', wep: 'WEP', nopass: 'Brak' },
      toolbar: { type: 'Typ', ecc: 'Korekcja błędów', size: 'Rozmiar', download: 'Pobierz', downloadPng: 'Pobierz PNG', downloadSvg: 'Pobierz SVG', copy: 'Kopiuj zawartość', copied: 'Skopiowano!' },
      ecc: { L: 'Niski (7%)', M: 'Średni (15%)', Q: 'Kwartylowy (25%)', H: 'Wysoki (30%)' },
      scan: {
        start: 'Uruchom kamerę', stop: 'Zatrzymaj kamerę', upload: 'Prześlij obraz', switchCamera: 'Zmień kamerę', torch: 'Latarka',
        history: 'Historia skanowania', clear: 'Wyczyść', openLink: 'Otwórz', copy: 'Kopiuj', copied: 'Skopiowano!', empty: 'Brak zeskanowanych kodów',
        noSupport: 'Twoja przeglądarka nie obsługuje skanowania na żywo. Użyj Chrome lub Edge albo prześlij obraz.',
        permissionDenied: 'Odmówiono dostępu do kamery. Zezwól na dostęp, aby skanować.', notFound: 'W wybranym obrazie nie znaleziono żadnego kodu.',
        scanning: 'Skanowanie…', found: 'Wykryto kod'
      },
      misc: { placeholder: 'Wprowadź wartość, aby wygenerować kod QR', dataTooLong: 'Te dane są zbyt długie, aby zmieścić się w kodzie QR' }
    },
    sk: {
      mode: { generate: 'Generovať', scan: 'Skenovať' },
      type: {
        text: 'Text', url: 'URL', wifi: 'Wi-Fi', email: 'E-mail', tel: 'Telefón', sms: 'SMS', whatsapp: 'WhatsApp',
        vcard: 'Kontakt (vCard)', event: 'Udalosť', geo: 'Poloha', sepa: 'SEPA platba', czqr: 'Česká QR platba', bitcoin: 'Bitcoin'
      },
      field: {
        text: 'Text', url: 'Webová adresa', ssid: 'Názov siete (SSID)', password: 'Heslo', encryption: 'Šifrovanie', hidden: 'Skrytá sieť',
        to: 'Komu', subject: 'Predmet', body: 'Správa', number: 'Telefónne číslo', message: 'Správa',
        firstName: 'Meno', lastName: 'Priezvisko', phone: 'Telefón', email: 'E-mail', org: 'Organizácia', title: 'Pozícia', address: 'Adresa',
        eventTitle: 'Názov', location: 'Miesto', start: 'Začiatok', end: 'Koniec', description: 'Popis',
        lat: 'Zemepisná šírka', lon: 'Zemepisná dĺžka',
        name: 'Meno príjemcu', iban: 'IBAN', bic: 'BIC (voliteľné)', amount: 'Suma', currency: 'Mena', reference: 'Referencia',
        account: 'IBAN', variableSymbol: 'Variabilný symbol', specificSymbol: 'Špecifický symbol', constantSymbol: 'Konštantný symbol',
        address_btc: 'Bitcoinová adresa', label: 'Popis'
      },
      enc: { wpa: 'WPA/WPA2', wep: 'WEP', nopass: 'Žiadne' },
      toolbar: { type: 'Typ', ecc: 'Oprava chýb', size: 'Veľkosť', download: 'Stiahnuť', downloadPng: 'Stiahnuť PNG', downloadSvg: 'Stiahnuť SVG', copy: 'Kopírovať obsah', copied: 'Skopírované!' },
      ecc: { L: 'Nízka (7 %)', M: 'Stredná (15 %)', Q: 'Kvartilová (25 %)', H: 'Vysoká (30 %)' },
      scan: {
        start: 'Spustiť kameru', stop: 'Zastaviť kameru', upload: 'Nahrať obrázok', switchCamera: 'Prepnúť kameru', torch: 'Baterka',
        history: 'História skenovania', clear: 'Vymazať', openLink: 'Otvoriť', copy: 'Kopírovať', copied: 'Skopírované!', empty: 'Zatiaľ žiadne naskenované kódy',
        noSupport: 'Váš prehliadač nepodporuje živé skenovanie kódov. Skúste Chrome alebo Edge, alebo nahrajte obrázok.',
        permissionDenied: 'Prístup ku kamere bol zamietnutý. Pre skenovanie povoľte prístup ku kamere.', notFound: 'Vo vybranom obrázku sa nenašiel žiadny kód.',
        scanning: 'Skenujem…', found: 'Kód nájdený'
      },
      misc: { placeholder: 'Zadajte hodnotu pre vygenerovanie QR kódu', dataTooLong: 'Tieto dáta sú príliš dlhé na to, aby sa zmestili do QR kódu' }
    },
    uk: {
      mode: { generate: 'Створити', scan: 'Сканувати' },
      type: {
        text: 'Текст', url: 'URL', wifi: 'Wi-Fi', email: 'Ел. пошта', tel: 'Телефон', sms: 'SMS', whatsapp: 'WhatsApp',
        vcard: 'Контакт (vCard)', event: 'Подія', geo: 'Місцезнаходження', sepa: 'Платіж SEPA', czqr: 'Чеський QR-платіж', bitcoin: 'Bitcoin'
      },
      field: {
        text: 'Текст', url: 'Веб-адреса', ssid: 'Назва мережі (SSID)', password: 'Пароль', encryption: 'Шифрування', hidden: 'Прихована мережа',
        to: 'Кому', subject: 'Тема', body: 'Повідомлення', number: 'Номер телефону', message: 'Повідомлення',
        firstName: "Ім'я", lastName: 'Прізвище', phone: 'Телефон', email: 'Ел. пошта', org: 'Організація', title: 'Посада', address: 'Адреса',
        eventTitle: 'Назва', location: 'Місце', start: 'Початок', end: 'Кінець', description: 'Опис',
        lat: 'Широта', lon: 'Довгота',
        name: "Ім'я отримувача", iban: 'IBAN', bic: 'BIC (необов’язково)', amount: 'Сума', currency: 'Валюта', reference: 'Референс',
        account: 'IBAN', variableSymbol: 'Варіабельний символ', specificSymbol: 'Специфічний символ', constantSymbol: 'Константний символ',
        address_btc: 'Адреса Bitcoin', label: 'Мітка'
      },
      enc: { wpa: 'WPA/WPA2', wep: 'WEP', nopass: 'Немає' },
      toolbar: { type: 'Тип', ecc: 'Корекція помилок', size: 'Розмір', download: 'Завантажити', downloadPng: 'Завантажити PNG', downloadSvg: 'Завантажити SVG', copy: 'Копіювати вміст', copied: 'Скопійовано!' },
      ecc: { L: 'Низька (7%)', M: 'Середня (15%)', Q: 'Квартильна (25%)', H: 'Висока (30%)' },
      scan: {
        start: 'Увімкнути камеру', stop: 'Вимкнути камеру', upload: 'Завантажити зображення', switchCamera: 'Змінити камеру', torch: 'Ліхтарик',
        history: 'Історія сканування', clear: 'Очистити', openLink: 'Відкрити', copy: 'Копіювати', copied: 'Скопійовано!', empty: 'Ще немає відсканованих кодів',
        noSupport: 'Ваш браузер не підтримує сканування в реальному часі. Спробуйте Chrome або Edge, або завантажте зображення.',
        permissionDenied: 'Доступ до камери відхилено. Дозвольте доступ до камери для сканування.', notFound: 'На вибраному зображенні код не знайдено.',
        scanning: 'Сканування…', found: 'Код знайдено'
      },
      misc: { placeholder: 'Введіть значення для створення QR-коду', dataTooLong: 'Ці дані занадто довгі для QR-коду' }
    }
  };

  var SUPPORTED_LANGS = ['en', 'cs', 'de', 'es', 'fr', 'pl', 'sk', 'uk'];

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function uid() {
    return 'nqr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  // =======================================================================
  // QR content type definitions & string builders
  // =======================================================================

  function esc(value) { return value == null ? '' : String(value); }
  function wifiEscape(value) { return esc(value).replace(/([\\;,:"])/g, '\\$1'); }
  function vcardEscape(value) { return esc(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1'); }
  function icsEscape(value) { return esc(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1'); }
  function normalizeUrl(value) {
    var v = esc(value).trim();
    if (!v) return '';
    if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = 'https://' + v;
    return v;
  }
  function digitsOnly(value) { return esc(value).replace(/[^\d+]/g, ''); }
  function icsDate(value, allDay) {
    var v = esc(value);
    if (!v) return '';
    if (allDay) return v.replace(/-/g, '');
    var d = new Date(v);
    if (isNaN(d.getTime())) return v.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  }

  var TYPE_DEFS = [
    {
      id: 'text',
      fields: [{ key: 'text', label: 'text', kind: 'textarea' }],
      build: function (f) { return esc(f.text); }
    },
    {
      id: 'url',
      fields: [{ key: 'url', label: 'url', kind: 'text', placeholder: 'https://example.com' }],
      build: function (f) { return normalizeUrl(f.url); }
    },
    {
      id: 'wifi',
      fields: [
        { key: 'ssid', label: 'ssid', kind: 'text' },
        { key: 'password', label: 'password', kind: 'password' },
        { key: 'encryption', label: 'encryption', kind: 'select', options: ['wpa', 'wep', 'nopass'], default: 'wpa' },
        { key: 'hidden', label: 'hidden', kind: 'checkbox' }
      ],
      build: function (f) {
        var enc = (f.encryption || 'wpa').toUpperCase();
        if (enc === 'NOPASS') enc = 'nopass';
        var parts = ['WIFI:T:' + enc, 'S:' + wifiEscape(f.ssid)];
        if (enc !== 'nopass') parts.push('P:' + wifiEscape(f.password));
        if (f.hidden) parts.push('H:true');
        return parts.join(';') + ';;';
      }
    },
    {
      id: 'email',
      fields: [
        { key: 'to', label: 'to', kind: 'text' },
        { key: 'subject', label: 'subject', kind: 'text' },
        { key: 'body', label: 'body', kind: 'textarea' }
      ],
      build: function (f) {
        var params = [];
        if (f.subject) params.push('subject=' + encodeURIComponent(f.subject));
        if (f.body) params.push('body=' + encodeURIComponent(f.body));
        return 'mailto:' + esc(f.to) + (params.length ? '?' + params.join('&') : '');
      }
    },
    {
      id: 'tel',
      fields: [{ key: 'number', label: 'number', kind: 'text' }],
      build: function (f) { return 'tel:' + digitsOnly(f.number); }
    },
    {
      id: 'sms',
      fields: [
        { key: 'number', label: 'number', kind: 'text' },
        { key: 'message', label: 'message', kind: 'textarea' }
      ],
      build: function (f) {
        var body = f.message ? '?body=' + encodeURIComponent(f.message) : '';
        return 'sms:' + digitsOnly(f.number) + body;
      }
    },
    {
      id: 'whatsapp',
      fields: [
        { key: 'number', label: 'number', kind: 'text' },
        { key: 'message', label: 'message', kind: 'textarea' }
      ],
      build: function (f) {
        var num = digitsOnly(f.number).replace(/^\+/, '');
        var text = f.message ? '?text=' + encodeURIComponent(f.message) : '';
        return 'https://wa.me/' + num + text;
      }
    },
    {
      id: 'vcard',
      fields: [
        { key: 'firstName', label: 'firstName', kind: 'text' },
        { key: 'lastName', label: 'lastName', kind: 'text' },
        { key: 'phone', label: 'phone', kind: 'text' },
        { key: 'email', label: 'email', kind: 'text' },
        { key: 'org', label: 'org', kind: 'text' },
        { key: 'title', label: 'title', kind: 'text' },
        { key: 'url', label: 'url', kind: 'text' },
        { key: 'address', label: 'address', kind: 'text' }
      ],
      build: function (f) {
        var lines = ['BEGIN:VCARD', 'VERSION:3.0'];
        lines.push('N:' + vcardEscape(f.lastName) + ';' + vcardEscape(f.firstName) + ';;;');
        lines.push('FN:' + vcardEscape((f.firstName || '') + ' ' + (f.lastName || '')).trim());
        if (f.org) lines.push('ORG:' + vcardEscape(f.org));
        if (f.title) lines.push('TITLE:' + vcardEscape(f.title));
        if (f.phone) lines.push('TEL;TYPE=CELL:' + digitsOnly(f.phone));
        if (f.email) lines.push('EMAIL:' + vcardEscape(f.email));
        if (f.url) lines.push('URL:' + vcardEscape(normalizeUrl(f.url)));
        if (f.address) lines.push('ADR:;;' + vcardEscape(f.address) + ';;;;');
        lines.push('END:VCARD');
        return lines.join('\n');
      }
    },
    {
      id: 'event',
      fields: [
        { key: 'eventTitle', label: 'eventTitle', kind: 'text' },
        { key: 'location', label: 'location', kind: 'text' },
        { key: 'start', label: 'start', kind: 'datetime-local' },
        { key: 'end', label: 'end', kind: 'datetime-local' },
        { key: 'description', label: 'description', kind: 'textarea' }
      ],
      build: function (f) {
        var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT'];
        lines.push('SUMMARY:' + icsEscape(f.eventTitle));
        if (f.location) lines.push('LOCATION:' + icsEscape(f.location));
        if (f.start) lines.push('DTSTART:' + icsDate(f.start));
        if (f.end) lines.push('DTEND:' + icsDate(f.end));
        if (f.description) lines.push('DESCRIPTION:' + icsEscape(f.description));
        lines.push('END:VEVENT', 'END:VCALENDAR');
        return lines.join('\n');
      }
    },
    {
      id: 'geo',
      fields: [
        { key: 'lat', label: 'lat', kind: 'text' },
        { key: 'lon', label: 'lon', kind: 'text' }
      ],
      build: function (f) { return 'geo:' + esc(f.lat) + ',' + esc(f.lon); }
    },
    {
      id: 'sepa',
      fields: [
        { key: 'name', label: 'name', kind: 'text' },
        { key: 'iban', label: 'iban', kind: 'text' },
        { key: 'bic', label: 'bic', kind: 'text' },
        { key: 'amount', label: 'amount', kind: 'text' },
        { key: 'currency', label: 'currency', kind: 'text', default: 'EUR' },
        { key: 'reference', label: 'reference', kind: 'text' }
      ],
      build: function (f) {
        var amount = f.amount ? (f.currency || 'EUR') + parseFloat(f.amount).toFixed(2) : '';
        var lines = ['BCD', '002', '1', 'SCT', esc(f.bic).toUpperCase(), esc(f.name), esc(f.iban).replace(/\s/g, '').toUpperCase(), amount, '', '', esc(f.reference)];
        return lines.join('\n');
      }
    },
    {
      id: 'czqr',
      fields: [
        { key: 'account', label: 'account', kind: 'text', placeholder: 'CZ5855000000001265098001' },
        { key: 'amount', label: 'amount', kind: 'text' },
        { key: 'variableSymbol', label: 'variableSymbol', kind: 'text' },
        { key: 'specificSymbol', label: 'specificSymbol', kind: 'text' },
        { key: 'constantSymbol', label: 'constantSymbol', kind: 'text' },
        { key: 'message', label: 'message', kind: 'text' }
      ],
      build: function (f) {
        var parts = ['SPD', '1.0'];
        var pairs = [];
        if (f.account) pairs.push('ACC:' + esc(f.account).replace(/\s/g, '').toUpperCase());
        if (f.amount) pairs.push('AM:' + parseFloat(f.amount).toFixed(2));
        pairs.push('CC:CZK');
        if (f.message) pairs.push('MSG:' + esc(f.message).replace(/\*/g, ''));
        if (f.variableSymbol) pairs.push('X-VS:' + digitsOnly(f.variableSymbol));
        if (f.specificSymbol) pairs.push('X-SS:' + digitsOnly(f.specificSymbol));
        if (f.constantSymbol) pairs.push('X-KS:' + digitsOnly(f.constantSymbol));
        return parts.join('*') + '*' + pairs.join('*');
      }
    },
    {
      id: 'bitcoin',
      fields: [
        { key: 'address_btc', label: 'address_btc', kind: 'text' },
        { key: 'amount', label: 'amount', kind: 'text' },
        { key: 'label', label: 'label', kind: 'text' }
      ],
      build: function (f) {
        var params = [];
        if (f.amount) params.push('amount=' + esc(f.amount));
        if (f.label) params.push('label=' + encodeURIComponent(f.label));
        return 'bitcoin:' + esc(f.address_btc) + (params.length ? '?' + params.join('&') : '');
      }
    }
  ];

  function findTypeDef(id) {
    for (var i = 0; i < TYPE_DEFS.length; i++) if (TYPE_DEFS[i].id === id) return TYPE_DEFS[i];
    return TYPE_DEFS[0];
  }

  // =======================================================================
  // Embedded CSS (replaced by minify.py at build time)
  // =======================================================================

  var EMBEDDED_CSS = '';

  var sharedSheet = null;
  var sharedSheetFailed = false;

  function getSharedSheet(cssText) {
    if (sharedSheet || sharedSheetFailed) return sharedSheet;
    if (typeof CSSStyleSheet === 'undefined' || !('adoptedStyleSheets' in Document.prototype)) {
      sharedSheetFailed = true;
      return null;
    }
    try {
      sharedSheet = new CSSStyleSheet();
      sharedSheet.replaceSync(cssText);
    } catch (err) {
      sharedSheet = null;
      sharedSheetFailed = true;
    }
    return sharedSheet;
  }

  var VALID_MODES = ['generate', 'scan'];
  var VALID_THEMES = ['light', 'dark', 'auto'];
  var VALID_ECC = ['L', 'M', 'Q', 'H'];

  var DEFAULT_CONFIG = {
    mode: 'generate',
    theme: 'auto',
    lang: 'en',
    ecc: 'M',
    size: 240,
    type: 'text'
  };

  function oneOf(value, list, fallback) {
    return list.indexOf(value) !== -1 ? value : fallback;
  }

  var ICONS = {
    download: '<svg viewBox="0 0 24 24"><path d="M12 3v10.6l3.3-3.3 1.4 1.4L12 16.9l-4.7-4.2 1.4-1.4 3.3 3.3V3h0ZM5 19v2h14v-2H5Z"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M9 2 7.2 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.2L15 2H9Zm3 6a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>',
    upload: '<svg viewBox="0 0 24 24"><path d="M12 3 6.5 8.5 8 10l3-3v9h2V7l3 3 1.5-1.5L12 3ZM5 19v2h14v-2H5Z"/></svg>',
    torch: '<svg viewBox="0 0 24 24"><path d="M9 2h6l-1 6h2l-6 12 1-8H9l1-6H8l1-4Z"/></svg>',
    switchCam: '<svg viewBox="0 0 24 24"><path d="M6 5V2L2 6l4 4V7a5 5 0 0 0 8.6 3.5l-1.5-1.4A3 3 0 0 1 6 7Zm12 2V6l4 4-4 4v-3a5 5 0 0 0-8.6-3.5l1.5 1.4A3 3 0 0 1 18 9Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Z"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a3 3 0 1 1 4.2 4.2l-1.8 1.8-1.4-1.4 1.8-1.8a1 1 0 1 0-1.4-1.4L12 13.4a1 1 0 0 1-1.4 0Zm-3-3 1.8-1.8 1.4 1.4-1.8 1.8a1 1 0 1 0 1.4 1.4l3.5-3.5a1 1 0 0 1 1.4 1.4l-3.5 3.5a3 3 0 1 1-4.2-4.2Z"/></svg>'
  };

  var TEMPLATE = document.createElement('template');
  TEMPLATE.innerHTML =
    '<div class="nqr-root" part="root">' +
      '<div class="nqr-modeswitch" part="modeswitch" role="tablist">' +
        '<button type="button" class="nqr-mode-btn" data-mode="generate" role="tab"></button>' +
        '<button type="button" class="nqr-mode-btn" data-mode="scan" role="tab"></button>' +
      '</div>' +
      '<div class="nqr-panel nqr-panel-generate" part="panel-generate">' +
        '<div class="nqr-toolbar" part="toolbar">' +
          '<label class="nqr-field-inline"><span class="nqr-label nqr-label-type"></span>' +
            '<select class="nqr-type-select" part="type-select"></select>' +
          '</label>' +
          '<label class="nqr-field-inline"><span class="nqr-label nqr-label-ecc"></span>' +
            '<select class="nqr-ecc-select" part="ecc-select"></select>' +
          '</label>' +
        '</div>' +
        '<div class="nqr-body" part="body">' +
          '<form class="nqr-form" part="form"></form>' +
          '<div class="nqr-preview" part="preview">' +
            '<div class="nqr-canvas-wrap"><canvas class="nqr-canvas"></canvas></div>' +
            '<div class="nqr-preview-actions">' +
              '<button type="button" class="nqr-btn nqr-download-png-btn" part="button">' + ICONS.download + '<span></span></button>' +
              '<button type="button" class="nqr-btn nqr-download-svg-btn" part="button">' + ICONS.download + '<span></span></button>' +
              '<button type="button" class="nqr-btn nqr-copy-btn" part="button">' + ICONS.copy + '<span></span></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="nqr-panel nqr-panel-scan" part="panel-scan" hidden>' +
        '<div class="nqr-scan-toolbar" part="scan-toolbar">' +
          '<button type="button" class="nqr-btn nqr-scan-start-btn" part="button">' + ICONS.camera + '<span></span></button>' +
          '<button type="button" class="nqr-btn nqr-scan-switch-btn" part="button" hidden>' + ICONS.switchCam + '</button>' +
          '<button type="button" class="nqr-btn nqr-scan-torch-btn" part="button" hidden>' + ICONS.torch + '</button>' +
          '<label class="nqr-btn nqr-upload-btn" part="button">' + ICONS.upload + '<span></span><input type="file" accept="image/*" class="nqr-scan-file-input" hidden></label>' +
        '</div>' +
        '<div class="nqr-scan-viewport" part="scan-viewport">' +
          '<video class="nqr-scan-video" playsinline muted></video>' +
          '<canvas class="nqr-scan-canvas" hidden></canvas>' +
          '<div class="nqr-scan-frame"></div>' +
          '<p class="nqr-scan-message"></p>' +
        '</div>' +
        '<div class="nqr-scan-history" part="scan-history">' +
          '<div class="nqr-scan-history-head"><span class="nqr-label-history"></span><button type="button" class="nqr-link-btn nqr-scan-clear-btn"></button></div>' +
          '<ul class="nqr-scan-history-list"></ul>' +
        '</div>' +
      '</div>' +
    '</div>';

  class NeikiQR extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  NeikiQR.observedAttributes = ['data-mode', 'theme', 'lang', 'ecc', 'size', 'type'];

  NeikiQR.prototype._init = function () {
    this._config = Object.assign({}, DEFAULT_CONFIG);
    this._fields = {};
    this._value = '';
    this._ready = false;
    this._mediaQuery = null;
    this._stream = null;
    this._scanRAF = null;
    this._scanTrack = null;
    this._history = [];
    this._lastScanText = null;
    this._lastScanAt = 0;

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    this._injectStyles();

    var root = this.shadowRoot;
    this._root = root.querySelector('.nqr-root');
    this._modeButtons = root.querySelectorAll('.nqr-mode-btn');
    this._panelGenerate = root.querySelector('.nqr-panel-generate');
    this._panelScan = root.querySelector('.nqr-panel-scan');
    this._typeSelect = root.querySelector('.nqr-type-select');
    this._eccSelect = root.querySelector('.nqr-ecc-select');
    this._labelType = root.querySelector('.nqr-label-type');
    this._labelEcc = root.querySelector('.nqr-label-ecc');
    this._form = root.querySelector('.nqr-form');
    this._canvas = root.querySelector('.nqr-canvas');
    this._downloadPngBtn = root.querySelector('.nqr-download-png-btn');
    this._downloadSvgBtn = root.querySelector('.nqr-download-svg-btn');
    this._copyBtn = root.querySelector('.nqr-copy-btn');

    this._scanStartBtn = root.querySelector('.nqr-scan-start-btn');
    this._scanSwitchBtn = root.querySelector('.nqr-scan-switch-btn');
    this._scanTorchBtn = root.querySelector('.nqr-scan-torch-btn');
    this._uploadInput = root.querySelector('.nqr-scan-file-input');
    this._uploadLabel = root.querySelector('.nqr-upload-btn span');
    this._video = root.querySelector('.nqr-scan-video');
    this._scanCanvas = root.querySelector('.nqr-scan-canvas');
    this._scanMessage = root.querySelector('.nqr-scan-message');
    this._scanHistoryList = root.querySelector('.nqr-scan-history-list');
    this._scanClearBtn = root.querySelector('.nqr-scan-clear-btn');
    this._labelHistory = root.querySelector('.nqr-label-history');

    this._bindStaticEvents();
  };

  NeikiQR.prototype._injectStyles = function () {
    if (EMBEDDED_CSS) {
      var sheet = getSharedSheet(EMBEDDED_CSS);
      if (sheet) {
        this.shadowRoot.adoptedStyleSheets = [sheet];
        return;
      }
      var style = document.createElement('style');
      style.textContent = EMBEDDED_CSS;
      this.shadowRoot.insertBefore(style, this.shadowRoot.firstChild);
      return;
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = this._resolveStylesheetUrl();
    this.shadowRoot.insertBefore(link, this.shadowRoot.firstChild);
  };

  NeikiQR.prototype._resolveStylesheetUrl = function () {
    var scriptEl = document.currentScript;
    if (!scriptEl) {
      var scripts = document.querySelectorAll('script[src]');
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (/neiki-qr(\.min)?\.js/.test(scripts[i].src)) { scriptEl = scripts[i]; break; }
      }
    }
    var src = scriptEl ? scriptEl.src : '';
    if (/\.min\.js(\?.*)?$/.test(src)) return src.replace(/\.min\.js(\?.*)?$/, '.min.css$1');
    if (/\.js(\?.*)?$/.test(src)) return src.replace(/\.js(\?.*)?$/, '.css$1');
    return 'neiki-qr.css';
  };

  // ---------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------

  NeikiQR.prototype.connectedCallback = function () {
    this._readAttributesIntoConfig();
    this._applyTheme();
    this._renderModeSwitch();
    this._renderTypeSelect();
    this._renderEccSelect();
    this._renderForm();
    this._renderScanStrings();
    this._updatePanels();
    this._regenerate();
    if (!this._ready) {
      this._ready = true;
      this._emit('ready', { config: this.getConfig() });
    }
  };

  NeikiQR.prototype.disconnectedCallback = function () {
    if (this._mediaQuery) {
      this._mediaQuery.removeEventListener('change', this._onMediaChangeBound);
      this._mediaQuery = null;
    }
    this.stopScan();
  };

  NeikiQR.prototype.attributeChangedCallback = function (name, oldValue, newValue) {
    if (oldValue === newValue || !this._config) return;
    this._readAttributesIntoConfig();
    if (!this.isConnected) return;
    this._applyTheme();
    if (name === 'lang') { this._renderTypeSelect(); this._renderEccSelect(); this._renderForm(); this._renderScanStrings(); this._renderHistory(); }
    if (name === 'type') { this._typeSelect.value = this._config.type; this._renderForm(); }
    if (name === 'data-mode') this._updatePanels();
    this._regenerate();
  };

  NeikiQR.prototype._readAttributesIntoConfig = function () {
    var cfg = this._config;
    cfg.mode = oneOf(this.getAttribute('data-mode'), VALID_MODES, cfg.mode || DEFAULT_CONFIG.mode);
    cfg.theme = oneOf(this.getAttribute('theme'), VALID_THEMES, cfg.theme || DEFAULT_CONFIG.theme);
    cfg.ecc = oneOf(this.getAttribute('ecc'), VALID_ECC, cfg.ecc || DEFAULT_CONFIG.ecc);
    var size = parseInt(this.getAttribute('size'), 10);
    cfg.size = isNaN(size) ? (cfg.size || DEFAULT_CONFIG.size) : Math.max(80, Math.min(1000, size));
    var type = this.getAttribute('type');
    if (type && findTypeDef(type)) cfg.type = type;
    var lang = this.getAttribute('lang');
    if (lang) cfg.lang = lang;
  };

  NeikiQR.prototype._applyTheme = function () {
    var theme = this._config.theme;
    if (this._mediaQuery) {
      this._mediaQuery.removeEventListener('change', this._onMediaChangeBound);
      this._mediaQuery = null;
    }
    if (theme === 'auto') {
      this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this._onMediaChangeBound = this._onMediaChange.bind(this);
      this._mediaQuery.addEventListener('change', this._onMediaChangeBound);
      this.setAttribute('resolved-theme', this._mediaQuery.matches ? 'dark' : 'light');
    } else {
      this.setAttribute('resolved-theme', theme);
    }
  };

  NeikiQR.prototype._onMediaChange = function (event) {
    this.setAttribute('resolved-theme', event.matches ? 'dark' : 'light');
  };

  // ---------------------------------------------------------------------
  // i18n
  // ---------------------------------------------------------------------

  NeikiQR.prototype._t = function (path) {
    var lang = TRANSLATIONS[this._config.lang] ? this._config.lang : 'en';
    var dict = TRANSLATIONS[lang];
    var parts = path.split('.');
    var value = dict;
    for (var i = 0; i < parts.length; i++) value = value && value[parts[i]];
    if (value === undefined) {
      value = TRANSLATIONS.en;
      for (i = 0; i < parts.length; i++) value = value && value[parts[i]];
    }
    return value || path;
  };

  NeikiQR.prototype.addTranslations = function (lang, dict) {
    if (!lang || !dict) return this;
    var existing = TRANSLATIONS[lang] || {};
    var merged = {};
    Object.keys(existing).concat(Object.keys(dict)).forEach(function (section) {
      merged[section] = Object.assign({}, existing[section], dict[section]);
    });
    TRANSLATIONS[lang] = merged;
    if (this.isConnected) this.connectedCallback();
    return this;
  };

  NeikiQR.prototype.setLang = function (lang) {
    this._config.lang = lang;
    this.setAttribute('lang', lang);
    return this;
  };

  // ---------------------------------------------------------------------
  // Static events / mode switch
  // ---------------------------------------------------------------------

  NeikiQR.prototype._bindStaticEvents = function () {
    var self = this;

    this._modeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.setMode(btn.getAttribute('data-mode'));
      });
    });

    this._typeSelect.addEventListener('change', function () {
      self.setType(self._typeSelect.value);
    });
    this._eccSelect.addEventListener('change', function () {
      self._config.ecc = self._eccSelect.value;
      self.setAttribute('ecc', self._eccSelect.value);
      self._regenerate();
    });

    this._form.addEventListener('input', function () {
      self._readFormIntoFields();
      self._regenerate();
    });

    this._downloadPngBtn.addEventListener('click', function () { self.download('neiki-qr', 'png'); });
    this._downloadSvgBtn.addEventListener('click', function () { self.download('neiki-qr', 'svg'); });
    this._copyBtn.addEventListener('click', function () { self._copyValue(); });

    this._scanStartBtn.addEventListener('click', function () {
      if (self._stream) self.stopScan(); else self.startScan();
    });
    this._scanSwitchBtn.addEventListener('click', function () { self._switchCamera(); });
    this._scanTorchBtn.addEventListener('click', function () { self._toggleTorch(); });
    this._uploadInput.addEventListener('change', function () {
      var file = self._uploadInput.files && self._uploadInput.files[0];
      if (file) self._scanImageFile(file);
      self._uploadInput.value = '';
    });
    this._scanClearBtn.addEventListener('click', function () { self.clearHistory(); });
  };

  NeikiQR.prototype._renderModeSwitch = function () {
    var self = this;
    this._modeButtons.forEach(function (btn) {
      var mode = btn.getAttribute('data-mode');
      btn.textContent = self._t('mode.' + mode);
      btn.classList.toggle('is-active', mode === self._config.mode);
      btn.setAttribute('aria-selected', mode === self._config.mode ? 'true' : 'false');
    });
  };

  NeikiQR.prototype._updatePanels = function () {
    var isGenerate = this._config.mode === 'generate';
    this._panelGenerate.hidden = !isGenerate;
    this._panelScan.hidden = isGenerate;
    this._renderModeSwitch();
    if (!isGenerate) {
      this._renderHistory();
    } else {
      this.stopScan();
    }
  };

  NeikiQR.prototype.setMode = function (mode) {
    mode = oneOf(mode, VALID_MODES, this._config.mode);
    this._config.mode = mode;
    this.setAttribute('data-mode', mode);
    this._updatePanels();
    this._emit('mode-change', { mode: mode });
    return this;
  };

  NeikiQR.prototype.getMode = function () { return this._config.mode; };

  // ---------------------------------------------------------------------
  // Generate mode
  // ---------------------------------------------------------------------

  NeikiQR.prototype._renderTypeSelect = function () {
    var self = this;
    this._labelType.textContent = this._t('toolbar.type');
    this._typeSelect.innerHTML = '';
    TYPE_DEFS.forEach(function (def) {
      var opt = document.createElement('option');
      opt.value = def.id;
      opt.textContent = self._t('type.' + def.id);
      self._typeSelect.appendChild(opt);
    });
    this._typeSelect.value = this._config.type;
  };

  NeikiQR.prototype._renderEccSelect = function () {
    var self = this;
    this._labelEcc.textContent = this._t('toolbar.ecc');
    this._eccSelect.innerHTML = '';
    VALID_ECC.forEach(function (level) {
      var opt = document.createElement('option');
      opt.value = level;
      opt.textContent = self._t('ecc.' + level);
      self._eccSelect.appendChild(opt);
    });
    this._eccSelect.value = this._config.ecc;
  };

  NeikiQR.prototype._renderForm = function () {
    var self = this;
    var def = findTypeDef(this._config.type);
    this._form.innerHTML = '';
    def.fields.forEach(function (field) {
      var wrap = document.createElement('label');
      wrap.className = 'nqr-form-field';
      var labelSpan = document.createElement('span');
      labelSpan.className = 'nqr-label';
      labelSpan.textContent = self._t('field.' + field.label);
      wrap.appendChild(labelSpan);

      var currentValue = self._fields[field.key] != null ? self._fields[field.key] : (field.default || '');
      var input;
      if (field.kind === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
        input.value = currentValue;
      } else if (field.kind === 'select') {
        input = document.createElement('select');
        (field.options || []).forEach(function (optId) {
          var opt = document.createElement('option');
          opt.value = optId;
          opt.textContent = self._t('enc.' + optId);
          input.appendChild(opt);
        });
        input.value = currentValue || field.default || '';
      } else if (field.kind === 'checkbox') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!self._fields[field.key];
      } else {
        input = document.createElement('input');
        input.type = field.kind === 'password' ? 'password' : (field.kind === 'datetime-local' ? 'datetime-local' : 'text');
        if (field.placeholder) input.placeholder = field.placeholder;
        input.value = currentValue;
      }
      input.setAttribute('data-field-key', field.key);
      input.className = 'nqr-input';
      wrap.appendChild(input);
      self._form.appendChild(wrap);
    });
    this._readFormIntoFields();
  };

  NeikiQR.prototype._readFormIntoFields = function () {
    var self = this;
    var inputs = this._form.querySelectorAll('[data-field-key]');
    inputs.forEach(function (input) {
      var key = input.getAttribute('data-field-key');
      self._fields[key] = input.type === 'checkbox' ? input.checked : input.value;
    });
  };

  NeikiQR.prototype.setType = function (type) {
    var def = findTypeDef(type);
    this._config.type = def.id;
    this.setAttribute('type', def.id);
    this._fields = {};
    this._renderForm();
    this._regenerate();
    return this;
  };

  NeikiQR.prototype.getType = function () { return this._config.type; };

  NeikiQR.prototype.setFields = function (fields) {
    Object.assign(this._fields, fields || {});
    this._renderForm();
    this._regenerate();
    return this;
  };

  NeikiQR.prototype.getFields = function () { return Object.assign({}, this._fields); };

  NeikiQR.prototype.getValue = function () { return this._value; };

  NeikiQR.prototype._regenerate = function () {
    if (this._config.mode !== 'generate' || !this._canvas) return;
    var def = findTypeDef(this._config.type);
    var value = def.build(this._fields || {});
    this._value = value;

    var ctx = this._canvas.getContext('2d');
    var size = this._config.size;
    this._canvas.width = size;
    this._canvas.height = size;

    if (!value) {
      ctx.clearRect(0, 0, size, size);
      this._lastResult = null;
      this._emit('change', { type: this._config.type, fields: this.getFields(), value: value });
      return;
    }

    try {
      var result = QR.encode(value, { eccLevel: this._config.ecc });
      this._lastResult = result;
      this._drawCanvas(ctx, result, size);
      this._emit('change', { type: this._config.type, fields: this.getFields(), value: value });
      this._emit('render', { version: result.version, eccLevel: result.eccLevel, size: size });
    } catch (err) {
      this._lastResult = null;
      ctx.clearRect(0, 0, size, size);
      this._emit('error', { message: err && err.message === 'QR_DATA_TOO_LONG' ? this._t('misc.dataTooLong') : String(err && err.message || err) });
    }
  };

  NeikiQR.prototype._drawCanvas = function (ctx, result, size) {
    var quiet = 4;
    var n = result.size + quiet * 2;
    var scale = size / n;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    for (var r = 0; r < result.size; r++) {
      for (var c = 0; c < result.size; c++) {
        if (result.modules[r][c]) {
          ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, Math.ceil(scale), Math.ceil(scale));
        }
      }
    }
  };

  NeikiQR.prototype._toSvgString = function () {
    if (!this._lastResult) return '';
    var result = this._lastResult;
    var quiet = 4;
    var n = result.size + quiet * 2;
    var path = '';
    for (var r = 0; r < result.size; r++) {
      for (var c = 0; c < result.size; c++) {
        if (result.modules[r][c]) path += 'M' + (c + quiet) + ',' + (r + quiet) + 'h1v1h-1z';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges">' +
      '<rect width="' + n + '" height="' + n + '" fill="#fff"/>' +
      '<path d="' + path + '" fill="#000"/>' +
      '</svg>';
  };

  NeikiQR.prototype.toDataURL = function (format) {
    if (!this._canvas || !this._lastResult) return '';
    return this._canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png');
  };

  NeikiQR.prototype.download = function (filename, format) {
    if (!this._lastResult) return this;
    filename = filename || 'neiki-qr';
    var url, ext;
    if (format === 'svg') {
      var blob = new Blob([this._toSvgString()], { type: 'image/svg+xml' });
      url = URL.createObjectURL(blob);
      ext = 'svg';
    } else {
      url = this._canvas.toDataURL('image/png');
      ext = 'png';
    }
    var a = document.createElement('a');
    a.href = url;
    a.download = filename + '.' + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (format === 'svg') setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    return this;
  };

  NeikiQR.prototype._copyValue = function () {
    var self = this;
    if (!this._value || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(this._value).then(function () {
      self._flashCopied(self._copyBtn);
    });
  };

  NeikiQR.prototype._flashCopied = function (btn) {
    var span = btn.querySelector('span');
    if (!span) return;
    var original = span.textContent;
    span.textContent = this._t('toolbar.copied');
    setTimeout(function () { span.textContent = original; }, 1500);
  };

  NeikiQR.prototype._renderScanStrings = function () {
    this._downloadPngBtn.querySelector('span').textContent = this._t('toolbar.downloadPng');
    this._downloadSvgBtn.querySelector('span').textContent = this._t('toolbar.downloadSvg');
    this._copyBtn.querySelector('span').textContent = this._t('toolbar.copy');

    this._scanStartBtn.querySelector('span').textContent = this._t(this._stream ? 'scan.stop' : 'scan.start');
    this._uploadLabel.textContent = this._t('scan.upload');
    this._scanTorchBtn.title = this._t('scan.torch');
    this._scanSwitchBtn.title = this._t('scan.switchCamera');
    this._labelHistory.textContent = this._t('scan.history');
    this._scanClearBtn.textContent = this._t('scan.clear');
    if (!this._stream) this._scanMessage.textContent = this._supportsBarcodeDetector() ? '' : this._t('scan.noSupport');
  };

  // ---------------------------------------------------------------------
  // Scan mode
  // ---------------------------------------------------------------------

  NeikiQR.prototype._supportsBarcodeDetector = function () {
    return typeof window.BarcodeDetector !== 'undefined';
  };

  NeikiQR.prototype.startScan = function () {
    var self = this;
    if (!this._supportsBarcodeDetector()) {
      this._scanMessage.textContent = this._t('scan.noSupport');
      return this;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this._scanMessage.textContent = this._t('scan.noSupport');
      return this;
    }
    var constraints = { video: { facingMode: this._facingMode || 'environment' } };
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      self._stream = stream;
      self._video.srcObject = stream;
      self._video.play();
      self._scanTrack = stream.getVideoTracks()[0];
      var caps = self._scanTrack.getCapabilities ? self._scanTrack.getCapabilities() : {};
      self._scanTorchBtn.hidden = !(caps && caps.torch);
      self._scanSwitchBtn.hidden = false;
      self._scanMessage.textContent = self._t('scan.scanning');
      self._renderScanStrings();
      self._detector = self._detector || new window.BarcodeDetector({ formats: ['qr_code'] });
      self._emit('scan-start', {});
      self._scanLoop();
    }).catch(function (err) {
      self._scanMessage.textContent = err && err.name === 'NotAllowedError' ? self._t('scan.permissionDenied') : self._t('scan.noSupport');
      self._emit('error', { message: String(err && err.message || err) });
    });
    return this;
  };

  NeikiQR.prototype.stopScan = function () {
    if (this._scanRAF) { cancelAnimationFrame(this._scanRAF); this._scanRAF = null; }
    if (this._stream) {
      this._stream.getTracks().forEach(function (track) { track.stop(); });
      this._stream = null;
      this._scanTrack = null;
    }
    if (this._video) this._video.srcObject = null;
    if (this._scanStartBtn) this._renderScanStrings();
    if (this._scanTorchBtn) this._scanTorchBtn.hidden = true;
    if (this._scanSwitchBtn) this._scanSwitchBtn.hidden = true;
    this._emit('scan-stop', {});
    return this;
  };

  NeikiQR.prototype._scanLoop = function () {
    var self = this;
    if (!this._stream || !this._detector) return;
    this._detector.detect(this._video).then(function (codes) {
      if (codes && codes.length) self._handleScanResult(codes[0].rawValue);
    }).catch(function () {}).then(function () {
      if (self._stream) self._scanRAF = requestAnimationFrame(function () { self._scanLoop(); });
    });
  };

  NeikiQR.prototype._switchCamera = function () {
    this._facingMode = this._facingMode === 'user' ? 'environment' : 'user';
    this.stopScan();
    this.startScan();
  };

  NeikiQR.prototype._toggleTorch = function () {
    if (!this._scanTrack) return;
    var self = this;
    this._torchOn = !this._torchOn;
    this._scanTrack.applyConstraints({ advanced: [{ torch: this._torchOn }] }).catch(function () { self._torchOn = false; });
  };

  NeikiQR.prototype._scanImageFile = function (file) {
    var self = this;
    if (!this._supportsBarcodeDetector()) {
      this._scanMessage.textContent = this._t('scan.noSupport');
      return;
    }
    this._detector = this._detector || new window.BarcodeDetector({ formats: ['qr_code'] });
    createImageBitmap(file).then(function (bitmap) {
      return self._detector.detect(bitmap);
    }).then(function (codes) {
      if (codes && codes.length) {
        self._handleScanResult(codes[0].rawValue);
      } else {
        self._scanMessage.textContent = self._t('scan.notFound');
      }
    }).catch(function (err) {
      self._emit('error', { message: String(err && err.message || err) });
    });
  };

  NeikiQR.prototype._handleScanResult = function (text) {
    var now = Date.now();
    if (text === this._lastScanText && now - this._lastScanAt < 2500) return;
    this._lastScanText = text;
    this._lastScanAt = now;

    var accepted = this.dispatchEvent(new CustomEvent('neiki-qr:scan', {
      bubbles: true, composed: true, cancelable: true, detail: { text: text }
    }));
    if (!accepted) return;

    this._history.unshift({ text: text, time: now });
    if (this._history.length > 25) this._history.length = 25;
    this._scanMessage.textContent = this._t('scan.found');
    this._renderHistory();
  };

  NeikiQR.prototype._renderHistory = function () {
    var self = this;
    var list = this._scanHistoryList;
    if (!list) return;
    list.innerHTML = '';
    if (!this._history.length) {
      var empty = document.createElement('li');
      empty.className = 'nqr-scan-history-empty';
      empty.textContent = this._t('scan.empty');
      list.appendChild(empty);
      return;
    }
    this._history.forEach(function (entry) {
      var li = document.createElement('li');
      li.className = 'nqr-scan-history-item';
      var text = document.createElement('span');
      text.className = 'nqr-scan-history-text';
      text.textContent = entry.text;
      li.appendChild(text);

      var actions = document.createElement('span');
      actions.className = 'nqr-scan-history-actions';

      var isLink = /^https?:\/\//i.test(entry.text);
      if (isLink) {
        var openBtn = document.createElement('a');
        openBtn.className = 'nqr-icon-btn';
        openBtn.href = entry.text;
        openBtn.target = '_blank';
        openBtn.rel = 'noopener noreferrer';
        openBtn.title = self._t('scan.openLink');
        openBtn.innerHTML = ICONS.link;
        actions.appendChild(openBtn);
      }

      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'nqr-icon-btn';
      copyBtn.title = self._t('scan.copy');
      copyBtn.innerHTML = ICONS.copy;
      copyBtn.addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(entry.text);
      });
      actions.appendChild(copyBtn);

      li.appendChild(actions);
      list.appendChild(li);
    });
  };

  NeikiQR.prototype.getHistory = function () { return this._history.slice(); };

  NeikiQR.prototype.clearHistory = function () {
    this._history = [];
    this._renderHistory();
    return this;
  };

  // ---------------------------------------------------------------------
  // Shared config API
  // ---------------------------------------------------------------------

  NeikiQR.prototype.setConfig = function (config) {
    config = config || {};
    if (config.theme) { this._config.theme = oneOf(config.theme, VALID_THEMES, this._config.theme); this.setAttribute('theme', this._config.theme); }
    if (config.ecc) { this._config.ecc = oneOf(config.ecc, VALID_ECC, this._config.ecc); this.setAttribute('ecc', this._config.ecc); }
    if (config.size) { this._config.size = config.size; this.setAttribute('size', config.size); }
    if (config.lang) this.setLang(config.lang);
    if (config.mode) this.setMode(config.mode);
    if (config.type) this.setType(config.type);
    return this;
  };

  NeikiQR.prototype.getConfig = function () { return Object.assign({}, this._config); };

  NeikiQR.prototype._emit = function (name, detail) {
    return this.dispatchEvent(new CustomEvent('neiki-qr:' + name, { bubbles: true, composed: true, detail: detail }));
  };

  customElements.define('neiki-qr', NeikiQR);
})();
