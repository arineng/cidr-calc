import { ByteArrayUtils } from './byte-array-utils';
import { IPV4_BYTE_COUNT, IPV6_BYTE_COUNT, IPV6_PART_COUNT } from './index';

export class IpNotationUtils {

  static regularNotationV4(bytes: number[]): string {
    ByteArrayUtils.validate(bytes, IPV4_BYTE_COUNT);

    return bytes.join('.');
  }

  static shortNotationV4(bytes: number[]): string {
    return this.regularNotationV4(bytes);
  }

  static fullNotationV4(bytes: number[]): string {
    ByteArrayUtils.validate(bytes, IPV4_BYTE_COUNT);

    return bytes.map(b => this.padLeft(b.toString(), 3)).join('.');
  }

  static regularNotationV6(bytes: number[]): string {
    ByteArrayUtils.validate(bytes, IPV6_BYTE_COUNT);

    let strParts = new Array<string>(IPV6_PART_COUNT);

    for (let i = 0; i < IPV6_PART_COUNT; ++i) {
      strParts[i] = ByteArrayUtils.bytePairToHex(bytes[i * 2], bytes[i * 2 + 1]);
    }

    return strParts.join(':');
  }

  static shortNotationV6(bytes: number[]): string {
    let regularNotation = this.regularNotationV6(bytes);

    let maxZeroSeqStart = -1;
    let maxZeroSeqLen = 0;
    let zeroSeqRe = /(^|:)0(:0)+($|:)/g;
    let m: RegExpExecArray | null;
    while ((m = zeroSeqRe.exec(regularNotation)) !== null) {
      if (maxZeroSeqStart < 0 || (m[0].length >> 1) > (maxZeroSeqLen >> 1)) {
        maxZeroSeqStart = m.index;
        maxZeroSeqLen = m[0].length;
      }
    }

    return maxZeroSeqStart < 0 ? regularNotation :
      regularNotation.substr(0, maxZeroSeqStart) + '::' + regularNotation.substr(maxZeroSeqStart + maxZeroSeqLen);
  }

  static fullNotationV6(bytes: number[]): string {
    ByteArrayUtils.validate(bytes, IPV6_BYTE_COUNT);

    let strParts = new Array<string>(IPV6_PART_COUNT);

    for (let i = 0; i < IPV6_PART_COUNT; ++i) {
      strParts[i] = this.padLeft(ByteArrayUtils.bytePairToHex(bytes[i * 2], bytes[i * 2 + 1]), 4);
    }

    return strParts.join(':');
  }

  private static padLeft(s: string, size: number): string {
    return s.length >= size ? s : '0'.repeat(size - s.length) + s;
  }
}
