// // pages/api/dns.js

// export default function handler(req, res) {
//   if (req.method === "POST") {
//     const { domain } = req.body;

//     // Mock DNS records with CNAME
//     const dnsRecords = {
//       "example.com": { type: "A", value: "93.184.216.34" },
//       "www.example.com": { type: "CNAME", value: "example.com" },
//       "google.com": { type: "A", value: "172.217.14.206" },
//       "www.google.com": { type: "CNAME", value: "google.com" },
//       "github.com": { type: "A", value: "140.82.114.4" },
//     };

//     const resolveDomain = (domain, records, visited = new Set()) => {
//       if (visited.has(domain)) {
//         return { error: "CNAME loop detected" };
//       }
//       visited.add(domain);

//       const record = records[domain];
//       if (!record) return { error: "Domain not found" };

//       if (record.type === "CNAME") {
//         return resolveDomain(record.value, records, visited);
//       }

//       return { record };
//     };

//     const steps = [
//       { server: "client-to-resolver", action: `Sent query for ${domain}` },
//       {
//         server: "resolver-to-root",
//         action: `Resolver sent query to Root Server for ${domain}`,
//       },
//       {
//         server: "root-to-resolver",
//         action: `Root Server responded with TLD Server information for ${domain}`,
//       },
//       {
//         server: "resolver-to-tld",
//         action: `Resolver sent query to TLD Server for ${domain}`,
//       },
//       {
//         server: "tld-to-resolver",
//         action: `TLD Server responded with Authoritative Server information for ${domain}`,
//       },
//       {
//         server: "resolver-to-auth",
//         action: `Resolver sent query to Authoritative Server for ${domain}`,
//       },
//       {
//         server: "auth-to-resolver",
//         action: `Authoritative Server responded with DNS record for ${domain}`,
//       },
//       {
//         server: "resolver-to-client",
//         action: `Resolver sent response back to Client for ${domain}`,
//       },
//     ];

//     const resolution = resolveDomain(domain, dnsRecords);

//     setTimeout(() => {
//       if (resolution.error) {
//         res.status(200).json({ steps, record: null, error: resolution.error });
//       } else {
//         res.status(200).json({ steps, record: resolution.record });
//       }
//     }, 3000);
//   } else {
//     res.status(405).json({ message: "Method Not Allowed" });
//   }
// }


// pages/api/dns.js

// Mock DNS zone data structure with various record types and TTL values
const zones = {
  root: {
    "com": { type: "NS", value: "com-servers.net", ttl: 172800 },
    "org": { type: "NS", value: "org-servers.net", ttl: 172800 },
    "net": { type: "NS", value: "net-servers.net", ttl: 172800 },
    "io": { type: "NS", value: "io-servers.net", ttl: 172800 }
  },
  
  tld: {
    "com": {
      "example.com": { type: "NS", value: "ns1.example.com", ttl: 86400 },
      "google.com": { type: "NS", value: "ns1.google.com", ttl: 86400 },
      "github.com": { type: "NS", value: "ns1.github.com", ttl: 86400 },
      "microsoft.com": { type: "NS", value: "ns1.microsoft.com", ttl: 86400 }
    },
    "org": {
      "wikipedia.org": { type: "NS", value: "ns1.wikipedia.org", ttl: 86400 },
      "mozilla.org": { type: "NS", value: "ns1.mozilla.org", ttl: 86400 }
    }
  },
  
  authoritative: {
    "example.com": {
      A: { type: "A", value: "93.184.216.34", ttl: 300 },
      AAAA: { type: "AAAA", value: "2606:2800:220:1:248:1893:25c8:1946", ttl: 300 },
      MX: [
        { type: "MX", value: "mail.example.com", priority: 10, ttl: 3600 },
        { type: "MX", value: "backup-mail.example.com", priority: 20, ttl: 3600 }
      ],
      TXT: { type: "TXT", value: "v=spf1 include:_spf.example.com ~all", ttl: 3600 },
      CNAME: {
        "www": { type: "CNAME", value: "example.com", ttl: 3600 },
        "mail": { type: "CNAME", value: "mail-server.example.com", ttl: 3600 }
      }
    },
    "google.com": {
      A: { type: "A", value: "172.217.14.206", ttl: 300 },
      AAAA: { type: "AAAA", value: "2607:f8b0:4004:814::200e", ttl: 300 },
      MX: [
        { type: "MX", value: "aspmx.l.google.com", priority: 1, ttl: 3600 },
        { type: "MX", value: "alt1.aspmx.l.google.com", priority: 5, ttl: 3600 }
      ],
      TXT: { type: "TXT", value: "v=spf1 include:_spf.google.com ~all", ttl: 3600 }
    },
    "github.com": {
      A: { type: "A", value: "140.82.114.4", ttl: 300 },
      AAAA: { type: "AAAA", value: "2606:50c0:8000::154", ttl: 300 },
      MX: [
        { type: "MX", value: "aspmx.l.github.com", priority: 1, ttl: 3600 }
      ],
      TXT: { type: "TXT", value: "v=spf1 include:_spf.github.com ~all", ttl: 3600 }
    }
  }
};

// Helper function to validate domain name format
const isValidDomain = (domain) => {
  const pattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return pattern.test(domain);
};

// Helper function to get TLD from domain
const getTLD = (domain) => {
  const parts = domain.split('.');
  return parts[parts.length - 1];
};

// Helper function to extract subdomain if present
const getSubdomain = (domain) => {
  const parts = domain.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  return null;
};

// Function to resolve CNAME records
const resolveCNAME = (domain, recordType, visited = new Set()) => {
  if (visited.has(domain)) {
    return { error: "CNAME loop detected" };
  }
  visited.add(domain);

  const domainParts = domain.split('.');
  const baseDomain = domainParts.slice(-2).join('.');
  const subdomain = domainParts.length > 2 ? domainParts[0] : null;

  const zoneData = zones.authoritative[baseDomain];
  if (!zoneData) {
    return { error: "Domain not found" };
  }

  if (subdomain && zoneData.CNAME && zoneData.CNAME[subdomain]) {
    const cnameRecord = zoneData.CNAME[subdomain];
    const targetDomain = cnameRecord.value;
    return resolveDomain(targetDomain, recordType, visited);
  }

  return null;
};

// Main resolution function
const resolveDomain = (domain, recordType, visited = new Set()) => {
  // Validate domain format
  if (!isValidDomain(domain)) {
    return { error: "Invalid domain format" };
  }

  const domainParts = domain.split('.');
  const baseDomain = domainParts.slice(-2).join('.');
  const subdomain = getSubdomain(domain);
  
  // First, check for CNAME if it's a subdomain
  if (subdomain) {
    const cnameResult = resolveCNAME(domain, recordType, visited);
    if (cnameResult) {
      return cnameResult;
    }
  }

  // Get zone data
  const zoneData = zones.authoritative[baseDomain];
  if (!zoneData) {
    return { error: "Domain not found" };
  }

  // Handle different record types
  switch (recordType) {
    case 'A':
    case 'AAAA':
      if (!zoneData[recordType]) {
        return { error: `No ${recordType} record found` };
      }
      return { record: zoneData[recordType] };

    case 'MX':
      if (!zoneData.MX) {
        return { error: "No MX records found" };
      }
      return { record: zoneData.MX };

    case 'TXT':
      if (!zoneData.TXT) {
        return { error: "No TXT record found" };
      }
      return { record: zoneData.TXT };

    case 'CNAME':
      if (!subdomain || !zoneData.CNAME || !zoneData.CNAME[subdomain]) {
        return { error: "No CNAME record found" };
      }
      return { record: zoneData.CNAME[subdomain] };

    default:
      return { error: "Unsupported record type" };
  }
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { domain, type = 'A' } = req.body;

  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  // Initialize steps array for visualization
  const steps = [
    { 
      server: "client-to-resolver",
      action: `Query for ${domain} (${type} record)`
    }
  ];

  // Simulate DNS resolution process
  const tld = getTLD(domain);
  
  // 1. Root server query
  steps.push(
    { 
      server: "resolver-to-root",
      action: `Querying root servers for .${tld} servers`
    },
    {
      server: "root-to-resolver",
      action: `Received .${tld} server information`
    }
  );

  // 2. TLD server query
  steps.push(
    {
      server: "resolver-to-tld",
      action: `Querying .${tld} servers for ${domain} nameservers`
    },
    {
      server: "tld-to-resolver",
      action: `Received authoritative nameservers for ${domain}`
    }
  );

  // 3. Authoritative server query
  steps.push(
    {
      server: "resolver-to-auth",
      action: `Querying authoritative servers for ${domain} ${type} record`
    }
  );

  // Perform the actual resolution
  const resolution = resolveDomain(domain, type);

  if (resolution.error) {
    steps.push({
      server: "auth-to-resolver",
      action: `Error: ${resolution.error}`
    });
    return res.status(200).json({ 
      steps,
      error: resolution.error
    });
  }

  // Success response
  steps.push(
    {
      server: "auth-to-resolver",
      action: `Received ${type} record for ${domain}`
    },
    {
      server: "resolver-to-client",
      action: `Returning ${type} record to client`
    }
  );

  // Simulate network delay
  setTimeout(() => {
    res.status(200).json({
      steps,
      record: resolution.record
    });
  }, 2000);
}