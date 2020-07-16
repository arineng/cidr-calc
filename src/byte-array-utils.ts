export class ByteArrayUtils {

  static plusOne(bytes: number[]): number[] {
    let result = bytes.slice(0);

    for (let i = result.length - 1; i >= 0; --i) {
      ++result[i];
      if (result[i] <= 0xff) {
        break;
      } else {
        result[i] = 0;
      }
    }

    return result;
  }

  static minusOne(bytes: number[]): number[] {
    let result = bytes.slice(0);
    for (let i = result.length - 1; i >= 0; --i) {
      if (result[i] > 0) {
        --result[i];
        break;
      } else {
        result[i] = 0xff;
      }
    }
    return result;
  }

  static compare(bytes1: number[], bytes2: number[]): number {
    let byteCount = this.validateSameSizeAndGetSize(bytes1, bytes2);

    for (let i = 0; i < byteCount; ++i) {
      if (bytes1[i] > bytes2[i]) {
        return 1;
      } else if (bytes1[i] < bytes2[i]) {
        return -1;
      }
    }
    return 0;
  }

  private static validateSameSizeAndGetSize(bytes1: number[], bytes2: number[]): number {
    if (bytes2.length !== bytes1.length) {
      throw new Error('Byte arrays need to have the same size');
    }
    return bytes1.length;
  }

  static validate(bytes: number[], byteCount: number): void {
    if (!bytes || bytes.length !== byteCount || !bytes.every(b => (b & 0xffffff00) === 0)) {
      throw new Error('Invalid byte array');
    }
  }

  static bytePairToHex(b1: number, b2: number): string {
    return (((b1 & 0xff) << 8) | (b2 & 0xff)).toString(16);
  }

  static createMasks(byteCount: number, prefixLen: number): number[] {
    // [b0,      b1,      ..., bLast,   ...]
    //  11111111 11111111 ...  11111000 ...
    let masks = new Array<number>(byteCount);

    let lastByteIndex = prefixLen >> 3;

    for (let i = 0; i < byteCount; ++i) {
      if (i < lastByteIndex) {
        masks[i] = 0xff;
      } else if (i === lastByteIndex) {
        masks[i] = (0xff00 >> (prefixLen & 7)) & 0xff;
      } else {
        masks[i] = 0;
      }
    }

    return masks;
  }

  static findPrefixLengthOfMaxStartingCidr(startIpBytes: number[], endIpBytes: number[]): number {
    let bitCount = this.validateSameSizeAndGetSize(startIpBytes, endIpBytes) * 8;

    let addrHostBits = this.numberOfTrailingZeros(startIpBytes);
    let hostBitsMaxAllowed = bitCount - this.numberOfLeadingEq(startIpBytes, endIpBytes);
    if (this.numberOfTrailingOnes(endIpBytes) < hostBitsMaxAllowed) {
      --hostBitsMaxAllowed;
    }

    return bitCount - Math.min(addrHostBits, hostBitsMaxAllowed);
  }

  private static numberOfLeadingEq(bytes1: number[], bytes2: number[]): number {
    let byteCount = this.validateSameSizeAndGetSize(bytes1, bytes2);

    let totalCount = 0;

    for (let i = 0; i < byteCount; ++i) {
      let xorResult = bytes1[i] ^ bytes2[i];
      let count = this.numberOfLeadingZerosInByte(xorResult);
      totalCount += count;
      if (count < 8) {
        break;
      }
    }

    return totalCount;
  }

  private static numberOfTrailingZeros(bytes: number[]): number {
    let totalCount = 0;

    for (let i = bytes.length - 1; i >= 0; --i) {
      let count = this.numberOfTrailingZerosInByte(bytes[i]);
      totalCount += count;
      if (count < 8) {
        break;
      }
    }

    return totalCount;
  }

  private static numberOfTrailingOnes(bytes: number[]): number {
    let totalCount = 0;

    for (let i = bytes.length - 1; i >= 0; --i) {
      let count = this.numberOfTrailingZerosInByte(~bytes[i] & 0xff);
      totalCount += count;
      if (count < 8) {
        break;
      }
    }

    return totalCount;
  }

  private static numberOfLeadingZerosInByte(b: number): number {
    if (b === 0) {
      return 8;
    }

    let n = 1;
    if (b >> 4 === 0) {
      n += 4;
      b <<= 4;
    }
    if (b >> 6 === 0) {
      n += 2;
      b <<= 2;
    }
    n -= b >> 7;

    return n;
  }

  private static numberOfTrailingZerosInByte(b: number): number {
    if (b === 0) {
      return 8;
    }

    let n = 7;
    let y;
    y = (b << 4) & 0xff;
    if (y !== 0) {
      n -= 4;
      b = y;
    }
    y = (b << 2) & 0xff;
    if (y !== 0) {
      n -= 2;
      b = y;
    }
    return n - (((b << 1) & 0xff) >> 7);
  }
}
