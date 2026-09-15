export interface CidrResult {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  totalAddresses: number;
  usableHosts: number;
  prefix: number;
}

function octetsToInt(octets: number[]): number {
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

function intToIp(value: number): string {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join(".");
}

/**
 * Parses and validates an IPv4 CIDR block ("192.168.1.0/24") and returns
 * the derived network range, or an error message for a malformed IP or a
 * prefix outside 0-32.
 */
export function parseCidr(input: string): { result: CidrResult | null; error: string | null } {
  const trimmed = input.trim();
  if (trimmed === "") return { result: null, error: null };

  const parts = trimmed.split("/");
  if (parts.length !== 2) {
    return { result: null, error: "Enter a CIDR block like 192.168.1.0/24." };
  }

  const [ipPart, prefixPart] = parts;
  const octetStrings = ipPart.split(".");
  if (octetStrings.length !== 4 || octetStrings.some((s) => s.trim() === "" || !/^\d+$/.test(s.trim()))) {
    return { result: null, error: "That's not a valid IPv4 address (expected four dot-separated numbers)." };
  }

  const octets = octetStrings.map((s) => Number(s.trim()));
  if (octets.some((n) => n < 0 || n > 255)) {
    return { result: null, error: "Each part of the IP address must be between 0 and 255." };
  }

  if (!/^\d+$/.test(prefixPart.trim())) {
    return { result: null, error: "The prefix must be a number between 0 and 32." };
  }
  const prefix = Number(prefixPart.trim());
  if (prefix < 0 || prefix > 32) {
    return { result: null, error: "The prefix must be between 0 and 32." };
  }

  const ipInt = octetsToInt(octets);
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);

  let usableHosts: number;
  let firstHostInt: number;
  let lastHostInt: number;
  if (prefix === 32) {
    usableHosts = 1;
    firstHostInt = networkInt;
    lastHostInt = networkInt;
  } else if (prefix === 31) {
    // RFC 3021: both addresses in a /31 are usable point-to-point hosts.
    usableHosts = 2;
    firstHostInt = networkInt;
    lastHostInt = broadcastInt;
  } else {
    usableHosts = totalAddresses - 2;
    firstHostInt = networkInt + 1;
    lastHostInt = broadcastInt - 1;
  }

  return {
    result: {
      network: intToIp(networkInt),
      broadcast: intToIp(broadcastInt),
      firstHost: intToIp(firstHostInt),
      lastHost: intToIp(lastHostInt),
      totalAddresses,
      usableHosts,
      prefix,
    },
    error: null,
  };
}
