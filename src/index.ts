import { ByteArrayUtils } from './byte-array-utils';
import { IpNotationUtils } from './ip-notation-utils';
import { IpParseUtils } from './ip-parse-utils';

export const IPV4_PART_COUNT = 4;
export const IPV4_BYTE_COUNT = 4;
export const IPV6_PART_COUNT = 8;
export const IPV6_BYTE_COUNT = 16;

export abstract class IpAddress {

  protected readonly bytes: number[];

  static of(ip: string): IpAddress {
    return IpParseUtils.fromString(ip);
  }

  static fromByteArray(bytes: number[]): IpAddress {
    return IpParseUtils.fromByteArray(bytes);
  }

  protected constructor(bytes: number[]) {
    this.bytes = bytes.slice(0);
  }

  toByteArray(): number[] {
    return this.bytes.slice(0);
  }

  compareTo(other: IpAddress): number {
    if (this.version() !== other.version()) {
      throw new Error('Only IpAddresses of the same version can be compared');
    }

    return ByteArrayUtils.compare(this.bytes, other.bytes);
  }

  abstract version(): string;

  abstract regularNotation(): string;

  abstract shortNotation(): string;

  abstract fullNotation(): string;
}

export class Ipv4Address extends IpAddress {

  constructor(bytes: number[]) {
    super(bytes);
  }

  version(): string {
    return '4';
  }

  regularNotation(): string {
    return IpNotationUtils.regularNotationV4(this.bytes);
  }

  shortNotation(): string {
    return IpNotationUtils.shortNotationV4(this.bytes);
  }

  fullNotation(): string {
    return IpNotationUtils.fullNotationV4(this.bytes);
  }
}

export class Ipv6Address extends IpAddress {

  constructor(bytes: number[]) {
    super(bytes);
  }

  version(): string {
    return '6';
  }

  regularNotation(): string {
    return IpNotationUtils.regularNotationV6(this.bytes);
  }

  shortNotation(): string {
    return IpNotationUtils.shortNotationV6(this.bytes);
  }

  fullNotation(): string {
    return IpNotationUtils.fullNotationV6(this.bytes);
  }
}

export class Cidr {

  readonly prefix: IpAddress;
  readonly prefixLen: number;

  constructor(prefix: IpAddress, prefixLen: number) {
    this.checkArgs(prefix, prefixLen);

    this.prefix = prefix;
    this.prefixLen = prefixLen;
  }

  private checkArgs(prefix: IpAddress, prefixLen: number) {
    if (!prefix) {
      throw new Error('prefix is required');
    }
    if (prefixLen === undefined || prefixLen === null) {
      throw new Error('prefix length is required');
    }
    if (prefix.version() == 'ipv4') {
      if (prefixLen < 0 || prefixLen > IPV4_BYTE_COUNT * 8) {
        throw new Error('Invalid prefix length for IPv4');
      }
    } else {
      if (prefixLen < 0 || prefixLen > IPV6_BYTE_COUNT * 8) {
        throw new Error('Invalid prefix length for IPv6');
      }
    }
  }

  toIpRange(): IpRange {
    let startIpBytes = this.prefix.toByteArray();
    let endIpBytes = startIpBytes.slice(0);

    let masks = ByteArrayUtils.createMasks(startIpBytes.length, this.prefixLen);

    for (let i = 0; i < startIpBytes.length; ++i) {
      startIpBytes[i] = startIpBytes[i] & masks[i];
      endIpBytes[i] = endIpBytes[i] | (~masks[i] & 0xff);
    }

    return new IpRange(IpAddress.fromByteArray(startIpBytes), IpAddress.fromByteArray(endIpBytes));
  }
}

export class IpRange {

  readonly startIpAddr: IpAddress;
  readonly endIpAddr: IpAddress;

  constructor(startIpAddr: IpAddress, endIpAddr: IpAddress) {
    this.checkArgs(startIpAddr, endIpAddr);

    this.startIpAddr = startIpAddr;
    this.endIpAddr = endIpAddr;
  }

  private checkArgs(startIpAddr: IpAddress, endIpAddr: IpAddress) {
    if (!startIpAddr) {
      throw new Error('Start IP address is required');
    }
    if (!endIpAddr) {
      throw new Error('End IP address is required');
    }
    if (startIpAddr.version() !== endIpAddr.version()) {
      throw new Error('Start and end IP addresses must both be IPv4 or IPv6');
    }
    if (startIpAddr.compareTo(endIpAddr) > 0) {
      throw new Error('Start IP address must not be greater than end IP address');
    }
  }

  toCidrs(): Cidr[] {
    let cidrs = new Array<Cidr>();

    let startIpBytes = this.startIpAddr.toByteArray();
    let endIpBytes = this.endIpAddr.toByteArray();

    let currIpBytes = startIpBytes;
    while (true) {
      let prefixLen = ByteArrayUtils.findPrefixLengthOfMaxStartingCidr(currIpBytes, endIpBytes);
      let currCidr = new Cidr(IpAddress.fromByteArray(currIpBytes), prefixLen);
      cidrs.push(currCidr);

      let lastIpBytes = currCidr.toIpRange().endIpAddr.toByteArray();
      if (ByteArrayUtils.compare(lastIpBytes, endIpBytes) >= 0) {
        break;
      }

      currIpBytes = ByteArrayUtils.plusOne(lastIpBytes);
    }

    return cidrs;
  }
}
