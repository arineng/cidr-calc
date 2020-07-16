# Overview

cidr-calc is a small javascript library for converting IP range to CIDRs
or CIDR to IP range.

## API

The API consists of three classes: `IpAddress`, `Cidr` and `IpRange`.

    import { Cidr, IpAddress, IpRange } from 'cidr-calc';

### IpAddress

An `IpAddress` class represents an IP address. Its instance functions are:

    toByteArray: returns a copy of the byte array representing the IP address
    next: return the next IP address
    prev: return the previous IP address
    compareTo: returns the result (-1, 0, or 1) that it compares to another IpAddress
               Only IpAddresses of the same version can be compared
    toString: return the string representation of the IP address
    version: returns a string '4' or '6'
    regularNotation: returns a regular string representation of the IP address
                     e.g., 10.0.1.2, 2001:0:0:f:f00:0:0:1
    shortNotation: returns a compact string representation of the IP address
                   e.g., 10.0.1.2, 2001::f:f00:0:0:1
    fullNotation: returns a full string representation of the IP address
                  e.g., 010.000.001.002, 2001:0000:0000:000f:0f00:0000:0000:0001

It also has two static functions:

    of: parses a string into an IpAddress
    fromByteArray: constructs an IpAddress from a byte array

The implementation of the `of` function was inspired by the `InetAddresses` class
in [guava], Google core libraries for Java.

### Cidr

A `Cidr` class can be constructed with an IP address and a prefix length.

    let cidr = new Cidr(IpAddress.of('192.168.0.0'), 16);

Then we can convert the CIDR to an IP range with the `toIpRange` function.

    let ipRange = cidr.toIpRange(); // 192.168.0.0 - 192.168.255.255

Note that the IP address passed in to construct the CIDR may not be the start IP of the range.

### IpRange

An `IpRange` class can be constructed with a start IP address and an end IP address.

    let ipRange = new IpRange(IpAddress.of('3::'), IpAddress.of('7:ffff:ffff:ffff:ffff:ffff:ffff:ffff'));

Then we can convert the IP range to a list of CIDRs (as a Cidr array) with the `toCidrs` function.

    let cidrs = ipRange.toCidrs(); // [3::/16, 4::/14]

The implementation of the `toCidrs` function was inspired by the `IPv4Range` and `IPv6Range`
classes in [ineter], a fast Java library for working with IP addresses, ranges, and subnets.

[guava]: https://github.com/google/guava
[ineter]: https://github.com/maltalex/ineter
