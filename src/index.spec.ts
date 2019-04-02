import { Cidr, IpAddress, IpRange } from './index';

describe('CidrCalc', () => {
  it('converts IP range to CIDRs correctly', () => {
    let testData = [
      '0.0.0.0-255.255.255.1 => 0.0.0.0/1 128.0.0.0/2 192.0.0.0/3 224.0.0.0/4 240.0.0.0/5 248.0.0.0/6 252.0.0.0/7'
      + ' 254.0.0.0/8 255.0.0.0/9 255.128.0.0/10 255.192.0.0/11 255.224.0.0/12 255.240.0.0/13 255.248.0.0/14'
      + ' 255.252.0.0/15 255.254.0.0/16 255.255.0.0/17 255.255.128.0/18 255.255.192.0/19 255.255.224.0/20'
      + ' 255.255.240.0/21 255.255.248.0/22 255.255.252.0/23 255.255.254.0/24 255.255.255.0/31',
      '0.0.0.0-255.255.255.255 => 0.0.0.0/0',
      '127.255.255.255-128.0.0.1 => 127.255.255.255/32 128.0.0.0/31',
      '10.100.0.0-10.255.255.255 => 10.100.0.0/14 10.104.0.0/13 10.112.0.0/12 10.128.0.0/9',
      '123.45.67.89-123.45.68.4 => 123.45.67.89/32 123.45.67.90/31 123.45.67.92/30 123.45.67.96/27 123.45.67.128/25 123.45.68.0/30 123.45.68.4/32',
      '2:db8::0-2001:dbf::1 => 2:db8::/29 2:dc0::/26 2:e00::/23 2:1000::/20 2:2000::/19 2:4000::/18 2:8000::/17'
      + ' 3::/16 4::/14 8::/13 10::/12 20::/11 40::/10 80::/9 100::/8 200::/7 400::/6 800::/5 1000::/4 2000::/16'
      + ' 2001::/21 2001:800::/22 2001:c00::/24 2001:d00::/25 2001:d80::/27 2001:da0::/28 2001:db0::/29 2001:db8::/30'
      + ' 2001:dbc::/31 2001:dbe::/32 2001:dbf::/127',
      '::-ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff => 0:0:0:0:0:0:0:0/0',
      '::-7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff => 0:0:0:0:0:0:0:0/1',
      '::ffff:ffff:ffff:ffff-::1:0:0:0:1fff => ::ffff:ffff:ffff:ffff/128 ::1:0:0:0:0/115',
      '::-1::1234 => 0:0:0:0:0:0:0:0/16 1:0:0:0:0:0:0:0/116 1:0:0:0:0:0:0:1000/119 1:0:0:0:0:0:0:1200/123 1:0:0:0:0:0:0:1220/124 1:0:0:0:0:0:0:1230/126 1:0:0:0:0:0:0:1234/128',
      '::ffff:ffff:ffff:ffff-::ffff:ffff:ffff:ffff => 0:0:0:0:ffff:ffff:ffff:ffff/128',
    ];

    for (let line of testData) {
      let arr = line.split(/\s*=>\s*/);
      let input = arr[0].split(/\s*-\s*/);
      let output = arr[1].split(/\s+/);
      expect(
        new IpRange(IpAddress.of(input[0]), IpAddress.of(input[1])).toCidrs()
      ).toEqual(
        output.map(c => {
          let carr = c.split('/');
          return new Cidr(IpAddress.of(carr[0]), parseInt(carr[1]));
        })
      );
    }
  });

  it('converts CIDR to IP range correctly', () => {
    let testData = [
      '0.0.0.0/0 => 0.0.0.0-255.255.255.255',
      '0.0.0.0/1 => 0.0.0.0-127.255.255.255',
      '128.0.0.0/2 => 128.0.0.0-191.255.255.255',
      '192.0.0.0/3 => 192.0.0.0-223.255.255.255',
      '224.0.0.0/4 => 224.0.0.0-239.255.255.255',
      '240.0.0.0/5 => 240.0.0.0-247.255.255.255',
      '248.0.0.0/6 => 248.0.0.0-251.255.255.255',
      '252.0.0.0/7 => 252.0.0.0-253.255.255.255',
      '254.0.0.0/8 => 254.0.0.0-254.255.255.255',
      '255.0.0.0/9 => 255.0.0.0-255.127.255.255',
      '255.128.0.0/10 => 255.128.0.0-255.191.255.255',
      '255.192.0.0/11 => 255.192.0.0-255.223.255.255',
      '255.224.0.0/12 => 255.224.0.0-255.239.255.255',
      '255.240.0.0/13 => 255.240.0.0-255.247.255.255',
      '255.248.0.0/14 => 255.248.0.0-255.251.255.255',
      '255.252.0.0/15 => 255.252.0.0-255.253.255.255',
      '255.254.0.0/16 => 255.254.0.0-255.254.255.255',
      '255.255.0.0/17 => 255.255.0.0-255.255.127.255',
      '255.255.128.0/18 => 255.255.128.0-255.255.191.255',
      '255.255.192.0/19 => 255.255.192.0-255.255.223.255',
      '255.255.224.0/20 => 255.255.224.0-255.255.239.255',
      '255.255.240.0/21 => 255.255.240.0-255.255.247.255',
      '255.255.248.0/22 => 255.255.248.0-255.255.251.255',
      '255.255.252.0/23 => 255.255.252.0-255.255.253.255',
      '255.255.254.0/24 => 255.255.254.0-255.255.254.255',
      '255.255.255.0/31 => 255.255.255.0-255.255.255.1',
      '123.45.67.89/32 => 123.45.67.89-123.45.67.89',
      '255.252.3.4/15 => 255.252.0.0-255.253.255.255',
      '2:db8::/29 => 2:db8::-2:dbf:ffff:ffff:ffff:ffff:ffff:ffff',
      '2:dc0::/26 => 2:dc0::-2:dff:ffff:ffff:ffff:ffff:ffff:ffff',
      '2:e00::/23 => 2:e00::-2:fff:ffff:ffff:ffff:ffff:ffff:ffff',
      '2:1000::/20 => 2:1000::-2:1fff:ffff:ffff:ffff:ffff:ffff:ffff',
      '2:2000::/19 => 2:2000::-2:3fff:ffff:ffff:ffff:ffff:ffff:ffff',
      '2:4000::/18 => 2:4000::-2:7fff:ffff:ffff:ffff:ffff:ffff:ffff',
      '2:8000::/17 => 2:8000::-2:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '3::/16 => 3::-3:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '4::/14 => 4::-7:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '8::/13 => 8::-f:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '10::/12 => 10::-1f:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '20::/11 => 20::-3f:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '40::/10 => 40::-7f:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '80::/9 => 80::-ff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '100::/8 => 100::-1ff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '200::/7 => 200::-3ff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '400::/6 => 400::-7ff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '800::/5 => 800::-fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '1000::/4 => 1000::-1fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '2000::/16 => 2000::-2000:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001::/21 => 2001::-2001:7ff:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001:800::/22 => 2001:800::-2001:bff:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001:c00::/24 => 2001:c00::-2001:cff:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001:d00::/25 => 2001:d00::-2001:d7f:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001:d80::/27 => 2001:d80::-2001:d9f:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001:da0::/28 => 2001:da0::-2001:daf:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001:db0::/29 => 2001:db0::-2001:db7:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001:db8::/30 => 2001:db8::-2001:dbb:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001:dbc::/31 => 2001:dbc::-2001:dbd:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001:dbe::/32 => 2001:dbe::-2001:dbe:ffff:ffff:ffff:ffff:ffff:ffff',
      '2001:dbf::/127 => 2001:dbf::-2001:dbf::1',
      '::/0 => ::-ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '::/1 => ::-7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '::ffff:ffff:ffff:ffff/128 => ::ffff:ffff:ffff:ffff-::ffff:ffff:ffff:ffff',
      '::f:f00:0:0:0/96 => ::f:f00:0:0:0-::f:f00:0:ffff:ffff',
      '::f:f00:0:0:f00/96 => ::f:f00:0:0:0-::f:f00:0:ffff:ffff',
      '2001::42/21 => 2001::-2001:7ff:ffff:ffff:ffff:ffff:ffff:ffff',
    ];

    for (let line of testData) {
      let arr = line.split(/\s*=>\s*/);
      let input = arr[0].split('/');
      let output = arr[1].split(/\s*-\s*/);
      expect(
        new Cidr(IpAddress.of(input[0]), parseInt(input[1])).toIpRange()
      ).toEqual(
        new IpRange(IpAddress.of(output[0]), IpAddress.of(output[1]))
      );
    }
  });
});
