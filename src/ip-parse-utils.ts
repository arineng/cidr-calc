import {
  IpAddress,
  IPV4_BYTE_COUNT,
  IPV4_PART_COUNT,
  Ipv4Address,
  IPV6_BYTE_COUNT,
  IPV6_PART_COUNT,
  Ipv6Address
} from './index';
import { ByteArrayUtils } from './byte-array-utils';

export class IpParseUtils {

  static fromString(ipString: string): IpAddress {
    return this.fromByteArray(this.ipStringToByteArray(ipString));
  }

  static fromByteArray(bytes: number[]): IpAddress {
    if (bytes.length === IPV4_BYTE_COUNT) {
      ByteArrayUtils.validate(bytes, IPV4_BYTE_COUNT);
      return new Ipv4Address(bytes);
    } else if (bytes.length === IPV6_BYTE_COUNT) {
      ByteArrayUtils.validate(bytes, IPV6_BYTE_COUNT);
      return new Ipv6Address(bytes);
    } else {
      throw new Error(`invalid byte array length: ${bytes.length}`);
    }
  }

  private static ipStringToByteArray(ipString: string): number[] {
    // Make a first pass to categorize the characters in this string.
    let hasColon = false;
    let hasDot = false;
    for (let i = 0; i < ipString.length; i++) {
      let c = ipString.charAt(i);
      if (c === '.') {
        hasDot = true;
      } else if (c === ':') {
        if (hasDot) {
          throw new Error('Colons must not appear after dots');
        }
        hasColon = true;
      } else if (!this.isHexDigit(c)) {
        throw new Error(`Invalid character found: ${c}`);
      }
    }

    // Now decide which address family to parse.
    if (hasColon) {
      if (hasDot) {
        ipString = this.convertDottedQuadToHex(ipString);
      }
      return this.textToNumericFormatV6(ipString);
    } else if (hasDot) {
      return this.textToNumericFormatV4(ipString);
    }

    throw new Error(`'${ipString} is not an IP string literal`);
  }

  private static convertDottedQuadToHex(ipString: string): string {
    let lastColon = ipString.lastIndexOf(':');
    let initialPart = ipString.substring(0, lastColon + 1);
    let dottedQuad = ipString.substring(lastColon + 1);
    let quad = this.textToNumericFormatV4(dottedQuad);
    let penultimate = ByteArrayUtils.bytePairToHex(quad[0], quad[1]);
    let ultimate = ByteArrayUtils.bytePairToHex(quad[2], quad[3]);
    return initialPart + penultimate + ':' + ultimate;
  }

  private static textToNumericFormatV4(ipString: string): number[] {
    let octets = ipString.split('.');
    if (octets.length !== IPV4_PART_COUNT) {
      throw new Error('IPv4 addresses must have exactly 4 octets');
    }

    return octets.map(octet => {
      if (octet.length <= 0) {
        throw new Error('Address octets must not be empty');
      }
      if (octet.length > 3) {
        throw new Error('Address octets must contain no more than 3 digits');
      }
      let v = Number(octet);
      if (!Number.isInteger(v)) {
        throw new Error('Address octets must be integer');
      }
      if ((v & 0xffffff00) !== 0) {
        throw new Error('Address octets must be between 0 and 255');
      }
      return v;
    });
  }

  private static textToNumericFormatV6(ipString: string): number[] {
    // An address can have [2..8] colons, and N colons make N+1 parts.
    let parts = ipString.split(':');
    if (parts.length < 3 || parts.length > IPV6_PART_COUNT + 1) {
      throw new Error(`Invalid number of colons found: ${parts.length - 1}`);
    }

    // Disregarding the endpoints, find '::' with nothing in between.
    // This indicates that a run of zeroes has been skipped.
    let skipIndex = -1;
    for (let i = 1; i < parts.length - 1; ++i) {
      if (parts[i].length === 0) {
        if (skipIndex >= 0) {
          throw new Error('Cannot have more than one ::');
        }
        skipIndex = i;
      }
    }

    let partsHi; // Number of parts to copy from above/before the '::'
    let partsLo; // Number of parts to copy from below/after the '::'
    if (skipIndex >= 0) {
      // If we found a '::', then check if it also covers the endpoints.
      partsHi = skipIndex;
      partsLo = parts.length - skipIndex - 1;
      if (parts[0].length === 0 && --partsHi !== 0) {
        throw new Error('^: found, requires ^::');
      }
      if (parts[parts.length - 1].length === 0 && --partsLo !== 0) {
        throw new Error(':$ found, requires ::$');
      }
    } else {
      // Otherwise, allocate the entire address to partsHi. The endpoints
      // could still be empty, but parseNonEmptyPartIntoByteArray() will check for that.
      partsHi = parts.length;
      partsLo = 0;
    }

    // If we found a ::, then we must have skipped at least one part.
    // Otherwise, we must have exactly the right number of parts.
    let partsSkipped = IPV6_PART_COUNT - (partsHi + partsLo);
    if (!(skipIndex >= 0 ? partsSkipped >= 1 : partsSkipped === 0)) {
      throw new Error('Invalid number of parts found');
    }

    // Now parse the hextets into a byte array.
    let bytes = new Array<number>(2 * IPV6_PART_COUNT);
    bytes.fill(0);
    for (let i = 0; i < partsHi; ++i) {
      this.parseNonEmptyPartIntoByteArray(parts[i], bytes, i * 2);
    }
    for (let i = partsLo; i > 0; --i) {
      this.parseNonEmptyPartIntoByteArray(parts[parts.length - i], bytes, (IPV6_PART_COUNT - i) * 2);
    }

    return bytes;
  }

  private static parseNonEmptyPartIntoByteArray(part: string, bytes: number[], loc: number): void {
    if (part.length <= 0) {
      throw new Error('Unexpected empty address part encountered');
    }
    if (part.length > 4) {
      throw new Error('Address parts must contain no more than 4 digits');
    }

    let v = parseInt(part, 16);
    if ((v & 0xffff0000) !== 0) {
      throw new Error(`Invalid v6 part found: ${part}`);
    }

    bytes[loc] = v >> 8;
    bytes[loc + 1] = v & 0xff;
  }

  private static isHexDigit(c: string): boolean {
    return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
  }
}
