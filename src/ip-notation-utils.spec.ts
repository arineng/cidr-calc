import { IpAddress } from './index';

describe('IpNotationUtils', () => {
  it('creates correct notations', () => {
    let testData = [
      '010.000.000.000, 10.0.0.0, 10.0.0.0, 10.000.0.000',
      '010.255.255.255, 10.255.255.255, 10.255.255.255',
      '0000:0000:0000:000f:0000:0000:0000:000f, 0:0:0:f:0:0:0:f, ::f:0:0:0:f',
      '0000:0000:ff00:0fff:0f00:0000:000f:0000, 0:0:ff00:fff:f00:0:f:0, ::ff00:fff:f00:0:f:0',
      '000f:0f00:0000:0000:0f00:0000:0000:0000, f:f00:0:0:f00:0:0:0, f:f00:0:0:f00::, f:f00:0:0:f00:0:0:0',
      '0000:0000:0000:000f:0f00:0000:0000:0f00, 0:0:0:f:f00:0:0:f00, ::f:f00:0:0:f00, 0:0:0:0F:F00:0:0:F00',
      '2001:0000:0000:000f:0f00:0000:0000:0001, 2001:0:0:f:f00:0:0:1, 2001::f:f00:0:0:1, 2001:0:0:f:f00:0:0:1',
      '2001:0db8:0000:0000:0fff:ffff:ffff:ffff, 2001:db8:0:0:fff:ffff:ffff:ffff, 2001:db8::fff:ffff:ffff:ffff, 2001:0db8:0:0:fff:ffff:ffff:ffff, 2001:db8:0000:0000:fff:ffff:ffff:ffff',
      '0000:0000:0000:0000:0000:0000:c0a8:0201, 0:0:0:0:0:0:c0a8:201, ::c0a8:201, ::192.168.2.1',
      '0000:0000:0000:0000:0000:ffff:c0a8:0302, 0:0:0:0:0:ffff:c0a8:302, ::ffff:c0a8:302, ::ffff:192.168.3.2',
    ];

    for (let line of testData) {
      let values = line.split(/\s*,\s*/);
      for (let i = 0; i < values.length; ++i) {
        let ipAddr = IpAddress.of(values[i]);
        expect(ipAddr.fullNotation()).toEqual(values[0]);
        expect(ipAddr.regularNotation()).toEqual(values[1]);
        expect(ipAddr.shortNotation()).toEqual(values[2]);
      }
    }
  });
});
