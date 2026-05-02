
-- =====================================================================
-- CCNA 200-301 v1.1 — seed modules, labs, steps
-- All labs use the Cisco IOS console simulator (simulator='cisco-ios')
-- =====================================================================

-- ---------- Modules ----------
INSERT INTO public.modules (slug, title, description, domain_code, sort_order, icon) VALUES
('ccna-network-fundamentals',      'Network Fundamentals (20%)',           'Components, topologies, cabling, TCP/UDP, IPv4 & IPv6, wireless, virtualization, switching.', 'CCNA-M1', 300, 'Network'),
('ccna-network-access',            'Network Access (20%)',                 'VLANs, trunks, CDP/LLDP, EtherChannel, RPVST+, wireless and device management.',            'CCNA-M2', 301, 'Network'),
('ccna-ip-connectivity',           'IP Connectivity (25%)',                'Routing table, forwarding, static routing, single-area OSPFv2 and FHRPs.',                  'CCNA-M3', 302, 'Network'),
('ccna-ip-services',               'IP Services (10%)',                    'NAT, NTP, DHCP, DNS, SNMP, syslog, QoS, SSH, TFTP/FTP.',                                    'CCNA-M4', 303, 'Network'),
('ccna-security-fundamentals',     'Security Fundamentals (15%)',          'Threats, ACLs, port security, DHCP snooping, DAI, AAA, WPA/WPA2/WPA3.',                     'CCNA-M5', 304, 'Network'),
('ccna-automation-programmability','Automation & Programmability (10%)',   'SDN, REST APIs, JSON, Ansible & Terraform, AI/ML in netops.',                               'CCNA-M6', 305, 'Network')
ON CONFLICT (slug) DO NOTHING;

-- ---------- Labs ----------
WITH m AS (SELECT slug, id FROM public.modules WHERE slug LIKE 'ccna-%')
INSERT INTO public.labs (module_id, slug, title, scenario, objective, difficulty, duration_min, simulator, sort_order)
SELECT m.id, v.slug, v.title, v.scenario, v.objective, v.difficulty, v.duration_min, v.simulator, v.sort_order
FROM (VALUES
  -- M1: Network Fundamentals
  ('ccna-network-fundamentals','ccna-packet-tracer-tour',     'Cisco IOS console tour',                   'Open the console, identify the device and read its baseline state.',                'Read version, interfaces and current config.',     'beginner',     20, 'cisco-ios', 1),
  ('ccna-network-fundamentals','ccna-subnetting-workshop',    'IPv4 subnetting workshop',                 'Carve 192.168.10.0/24 into four /26 subnets and verify with show commands.',        'Plan and apply a /26 subnet on Gi0/0.',            'beginner',     25, 'cisco-ios', 2),
  ('ccna-network-fundamentals','ccna-ipv6-addressing',        'IPv6 addressing & prefixes',               'Configure a global, link-local and ULA IPv6 address on Gi0/0 and verify.',           'IPv6 address up on the interface.',                'intermediate', 25, 'cisco-ios', 3),
  ('ccna-network-fundamentals','ccna-tcp-udp-capture',        'Inspect TCP/UDP behaviour with show ip',   'Use show ip interface brief and ping to reason about transport behaviour.',          'Verify reachability with ping & show int.',        'beginner',     20, 'cisco-ios', 4),
  ('ccna-network-fundamentals','ccna-mac-table-walkthrough',  'MAC address-table walkthrough',            'Inspect how the switch learns and ages MAC entries.',                                'Read the MAC address-table.',                       'beginner',     20, 'cisco-ios', 5),

  -- M2: Network Access
  ('ccna-network-access','ccna-vlan-trunk-config',  'Configure VLANs and a trunk',         'Create VLANs 10/20/99, assign access ports and bring up an 802.1Q trunk on Gi0/24.', 'VLANs created and trunk operational.',     'intermediate', 30, 'cisco-ios', 1),
  ('ccna-network-access','ccna-intervlan-routing',  'Inter-VLAN routing on a router',     'Build router-on-a-stick with subinterfaces for VLAN 10 and 20.',                     'Sub-interfaces up with dot1Q encapsulation.','intermediate', 30, 'cisco-ios', 2),
  ('ccna-network-access','ccna-cdp-lldp',           'Discover neighbours with CDP & LLDP', 'Enable CDP and LLDP and read who is on the other end of each port.',                 'Identify neighbours from both protocols.', 'beginner',     20, 'cisco-ios', 3),
  ('ccna-network-access','ccna-etherchannel-lacp',  'Bundle links with LACP EtherChannel', 'Bundle Gi0/1 and Gi0/2 into Po1 using LACP active mode.',                            'Po1 bundled and active.',                  'intermediate', 25, 'cisco-ios', 4),
  ('ccna-network-access','ccna-rpvst-stp',          'Tune Rapid PVST+ and verify root',    'Force this switch to be the root for VLAN 10 and confirm with show spanning-tree.',  'This switch is root for VLAN 10.',         'intermediate', 25, 'cisco-ios', 5),
  ('ccna-network-access','ccna-wlc-gui-wlan-create','Create a WLAN on the WLC (CLI proxy)','Walk through the equivalent CLI commands an SE would issue when creating a WLAN.',  'WLAN config simulated end-to-end.',        'beginner',     20, 'cisco-ios', 6),

  -- M3: IP Connectivity
  ('ccna-ip-connectivity','ccna-static-routing-ipv4', 'IPv4 static & default routes',     'Add a /24 static route and a default route, then verify in show ip route.',          'Static + default route installed.',        'beginner',     25, 'cisco-ios', 1),
  ('ccna-ip-connectivity','ccna-static-routing-ipv6', 'IPv6 static routing',              'Add an IPv6 static route to 2001:DB8:2::/64 via 2001:DB8:1::2.',                     'Route appears in show ipv6 route.',        'intermediate', 25, 'cisco-ios', 2),
  ('ccna-ip-connectivity','ccna-floating-static',     'Floating static route',            'Install a backup static route with AD 200 so the OSPF route wins normally.',         'Floating static present, OSPF preferred.', 'intermediate', 20, 'cisco-ios', 3),
  ('ccna-ip-connectivity','ccna-ospfv2-single-area',  'Single-area OSPFv2',               'Bring up OSPF process 1 in area 0 and advertise both directly-connected networks.',  'OSPF neighbour reaches FULL state.',       'intermediate', 35, 'cisco-ios', 4),
  ('ccna-ip-connectivity','ccna-ospf-dr-bdr',         'Inspect OSPF DR/BDR election',     'Verify which neighbour became DR/BDR on the broadcast segment.',                     'Read DR/BDR from show ip ospf neighbor.',  'intermediate', 20, 'cisco-ios', 5),
  ('ccna-ip-connectivity','ccna-fhrp-hsrp',           'Concept walk: FHRP / HSRP',         'Configure HSRP group 1 with virtual IP 192.168.1.254 (concept-level).',              'HSRP commands accepted by IOS.',           'intermediate', 20, 'cisco-ios', 6),

  -- M4: IP Services
  ('ccna-ip-services','ccna-static-nat',         'Static NAT mapping',                 'Map inside 192.168.1.10 to outside 203.0.113.10 for an internal web server.',       'Static NAT translation present.',          'intermediate', 25, 'cisco-ios', 1),
  ('ccna-ip-services','ccna-pat-overload',       'PAT (NAT overload)',                 'Configure inside source NAT overload using interface Gi0/1 as the global address.', 'PAT translations grow as you ping out.',   'intermediate', 25, 'cisco-ios', 2),
  ('ccna-ip-services','ccna-ntp-client-server',  'NTP client + server',                'Point the router at a public NTP server and verify clock sync.',                     'Clock synchronized to stratum 3.',         'beginner',     20, 'cisco-ios', 3),
  ('ccna-ip-services','ccna-dhcp-relay',         'DHCP relay (ip helper-address)',     'Forward DHCP requests from VLAN 10 to a central DHCP server at 10.0.0.50.',         'ip helper-address configured on Gi0/0.',   'intermediate', 25, 'cisco-ios', 4),
  ('ccna-ip-services','ccna-syslog-severity',    'Syslog severity levels',              'Send syslog level 6 messages to a logging host at 10.0.0.100.',                     'Syslog destination configured.',           'beginner',     15, 'cisco-ios', 5),
  ('ccna-ip-services','ccna-ssh-remote-access',  'Enable SSH for remote access',        'Generate RSA keys and restrict VTY lines to SSH only.',                              'Line vty 0 4 transport input ssh.',        'intermediate', 25, 'cisco-ios', 6),

  -- M5: Security Fundamentals
  ('ccna-security-fundamentals','ccna-device-hardening',  'Harden device access',                  'Set hostname, enable secret, console password and service password-encryption.',     'Device hardened with passwords + secrets.', 'beginner',     25, 'cisco-ios', 1),
  ('ccna-security-fundamentals','ccna-acl-extended',      'Extended ACL — permit web only',        'Build extended ACL WEB-IN allowing TCP 80/443 to host 192.168.1.50; deny rest.',     'ACL applied and counters incrementing.',    'intermediate', 30, 'cisco-ios', 2),
  ('ccna-security-fundamentals','ccna-port-security',     'Port security on access ports',         'Limit Gi0/2 to 2 MAC addresses with violation action shutdown.',                     'Port-security enforced on Gi0/2.',          'intermediate', 25, 'cisco-ios', 3),
  ('ccna-security-fundamentals','ccna-dhcp-snooping-dai', 'DHCP snooping + Dynamic ARP Inspection','Enable DHCP snooping for VLAN 10 and trust the uplink port.',                       'DHCP snooping active on VLAN 10.',          'intermediate', 25, 'cisco-ios', 4),
  ('ccna-security-fundamentals','ccna-aaa-radius',        'AAA with RADIUS',                       'Point the router at a RADIUS server for login authentication, fall back to local.',  'AAA configured with RADIUS first.',         'intermediate', 25, 'cisco-ios', 5),
  ('ccna-security-fundamentals','ccna-wpa2-psk-wlan',     'WPA2 PSK WLAN walk-through',            'Walk through the IOS commands an autonomous AP needs for a WPA2-PSK SSID.',          'WPA2-PSK SSID commands accepted.',          'beginner',     20, 'cisco-ios', 6),

  -- M6: Automation & Programmability
  ('ccna-automation-programmability','ccna-rest-api-postman',     'REST API request walk-through',  'Use IOS REST examples to reason about HTTP verbs and auth headers.',                'Identify GET/POST and Bearer token.',        'beginner',     20, 'cisco-ios', 1),
  ('ccna-automation-programmability','ccna-json-parsing',         'JSON anatomy on the wire',       'Read a JSON payload and identify objects, arrays, keys, values and types.',         'Trace each piece of a JSON document.',       'beginner',     15, 'cisco-ios', 2),
  ('ccna-automation-programmability','ccna-ansible-playbook-tour','Ansible playbook tour',          'Read a sample playbook that pushes IOS config and predict what each task does.',     'Map play → task → module → device.',         'beginner',     20, 'cisco-ios', 3),
  ('ccna-automation-programmability','ccna-sdn-controller-tour',  'SDN controller concept tour',    'Reason about overlay/underlay and where the control vs data plane lives in SDN.',    'Identify NB & SB APIs in a topology.',       'beginner',     20, 'cisco-ios', 4)
) AS v(module_slug, slug, title, scenario, objective, difficulty, duration_min, simulator, sort_order)
JOIN m ON m.slug = v.module_slug
ON CONFLICT (slug) DO NOTHING;

-- ---------- Steps (3 per lab) ----------

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-packet-tracer-tour')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Read the IOS version',          'Print the IOS version and uptime with show version.',                       'show version',                                '{"type":"command","contains":"show version"}'::jsonb, 10),
  (2, 'List interfaces with their IP', 'See every interface and its IP/state with show ip interface brief.',         'show ip interface brief',                     '{"type":"command","contains":"show ip int"}'::jsonb, 10),
  (3, 'Read the running config',       'Print the running-config to confirm what is currently active on the device.', 'show running-config',                         '{"type":"command","contains":"show running"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-subnetting-workshop')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Enter privileged mode + config', 'Type enable, then configure terminal to enter global config.',              'enable',                                      '{"type":"command","equals":"enable"}'::jsonb, 10),
  (2, 'Enter Gi0/0 interface mode',     'Drop into interface Gi0/0 with: interface GigabitEthernet0/0.',             'interface GigabitEthernet0/0',                '{"type":"command","contains":"interface gigabitethernet0/0"}'::jsonb, 10),
  (3, 'Set a /26 IP and bring it up',   'Apply ip address 192.168.10.65 255.255.255.192 then no shutdown.',          'ip address 192.168.10.65 255.255.255.192',    '{"type":"command","contains":"ip address 192.168.10.65"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-ipv6-addressing')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Drop into interface mode',  'enable → conf t → interface GigabitEthernet0/0.',                                'interface GigabitEthernet0/0',                '{"type":"command","contains":"interface gigabitethernet0/0"}'::jsonb, 10),
  (2, 'Apply a global IPv6 prefix','Add ipv6 address 2001:DB8:1::1/64.',                                              'ipv6 address 2001:DB8:1::1/64',               '{"type":"command","contains":"ipv6 address 2001:db8:1::1/64"}'::jsonb, 10),
  (3, 'Verify with show command',  'Use show ipv6 interface brief to confirm the prefix is active.',                  'show ipv6 interface brief',                   '{"type":"command","contains":"show ipv6 interface"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-tcp-udp-capture')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Inspect interfaces',         'show ip interface brief — confirm interfaces are up.',  'show ip interface brief', '{"type":"command","contains":"show ip int"}'::jsonb, 10),
  (2, 'Test reachability with ping','ping 10.0.0.2 — expect 5 successful echoes.',           'ping 10.0.0.2',           '{"type":"command","contains":"ping 10.0.0.2"}'::jsonb, 10),
  (3, 'Trace the path',             'traceroute 10.0.0.2 to view each hop.',                  'traceroute 10.0.0.2',     '{"type":"command","contains":"traceroute"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-mac-table-walkthrough')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Read the MAC address-table',  'Use show mac address-table to see learned MACs.', 'show mac address-table', '{"type":"command","contains":"show mac"}'::jsonb, 10),
  (2, 'Check VLAN bindings',         'show vlan brief — confirm which ports are in which VLAN.', 'show vlan brief', '{"type":"command","contains":"show vlan"}'::jsonb, 10),
  (3, 'Look at neighbours',          'show cdp neighbors to discover what is plugged in.', 'show cdp neighbors', '{"type":"command","contains":"show cdp"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-vlan-trunk-config')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Create VLAN 10',              'enable → conf t → vlan 10 → name DATA.',           'vlan 10',                              '{"type":"command","contains":"vlan 10"}'::jsonb, 10),
  (2, 'Trunk the uplink',            'Move to interface Gi0/24 and switchport mode trunk.','switchport mode trunk',              '{"type":"command","contains":"switchport mode trunk"}'::jsonb, 10),
  (3, 'Verify VLANs and trunks',     'show vlan brief, then show interfaces trunk.',     'show interfaces trunk',                '{"type":"command","contains":"show interfaces trunk"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-intervlan-routing')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Enter sub-interface for VLAN 10', 'interface GigabitEthernet0/0.10.',                              'interface GigabitEthernet0/0.10',  '{"type":"command","contains":"gigabitethernet0/0.10"}'::jsonb, 10),
  (2, 'Set dot1Q encapsulation',         'encapsulation dot1Q 10.',                                       'encapsulation dot1Q 10',           '{"type":"command","contains":"encapsulation dot1q 10"}'::jsonb, 10),
  (3, 'Apply IP & enable',               'ip address 192.168.10.1 255.255.255.0 then no shutdown.',       'ip address 192.168.10.1',          '{"type":"command","contains":"ip address 192.168.10.1"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-cdp-lldp')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'List CDP neighbours',  'Run show cdp neighbors to see Cisco-discovered devices.', 'show cdp neighbors',  '{"type":"command","contains":"show cdp"}'::jsonb, 10),
  (2, 'List LLDP neighbours', 'Run show lldp neighbors to see the standards-based view.','show lldp neighbors', '{"type":"command","contains":"show lldp"}'::jsonb, 10),
  (3, 'Inspect interfaces',   'show ip interface brief — match ports to neighbours.',    'show ip interface brief','{"type":"command","contains":"show ip int"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-etherchannel-lacp')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Enter Gi0/1',               'interface GigabitEthernet0/1.',                       'interface GigabitEthernet0/1', '{"type":"command","contains":"interface gigabitethernet0/1"}'::jsonb, 10),
  (2, 'Add to channel-group',      'channel-group 1 mode active (LACP).',                 'channel-group 1 mode active',  '{"type":"command","contains":"channel-group 1 mode active"}'::jsonb, 10),
  (3, 'Verify the bundle',         'show etherchannel summary — Po1 should show SU.',     'show etherchannel summary',    '{"type":"command","contains":"show etherchannel"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-rpvst-stp')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Enable rapid-pvst',         'spanning-tree mode rapid-pvst (in global config).',   'spanning-tree mode rapid-pvst', '{"type":"command","contains":"spanning-tree mode rapid-pvst"}'::jsonb, 10),
  (2, 'Force root for VLAN 10',    'spanning-tree vlan 10 root primary.',                 'spanning-tree vlan 10 root primary', '{"type":"command","contains":"spanning-tree vlan 10 root primary"}'::jsonb, 10),
  (3, 'Verify root',               'show spanning-tree vlan 10 — confirm This bridge is the root.', 'show spanning-tree', '{"type":"command","contains":"show spanning-tree"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-wlc-gui-wlan-create')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Create the SSID',           'Configure SSID name shadowx-corp on the AP/WLC (concept-level CLI proxy).', 'dot11 ssid shadowx-corp', '{"type":"command","contains":"shadowx-corp"}'::jsonb, 10),
  (2, 'Enable WPA2 PSK',           'authentication open / authentication key-management wpa.',                  'authentication key-management wpa', '{"type":"command","contains":"key-management wpa"}'::jsonb, 10),
  (3, 'Verify VLAN binding',       'show vlan brief to confirm the WLAN VLAN is present.',                       'show vlan brief',          '{"type":"command","contains":"show vlan"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-static-routing-ipv4')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Add a static route',     'Global config: ip route 192.168.2.0 255.255.255.0 10.0.0.2.', 'ip route 192.168.2.0 255.255.255.0 10.0.0.2', '{"type":"command","contains":"ip route 192.168.2.0"}'::jsonb, 10),
  (2, 'Add a default route',    'ip route 0.0.0.0 0.0.0.0 10.0.0.2.',                          'ip route 0.0.0.0 0.0.0.0 10.0.0.2',           '{"type":"command","contains":"ip route 0.0.0.0 0.0.0.0"}'::jsonb, 10),
  (3, 'Verify with show ip route','Confirm both routes appear.',                                'show ip route',                                '{"type":"command","contains":"show ip route"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-static-routing-ipv6')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Enable IPv6 routing',    'ipv6 unicast-routing.',                                   'ipv6 unicast-routing', '{"type":"command","contains":"ipv6 unicast-routing"}'::jsonb, 10),
  (2, 'Add an IPv6 static',     'ipv6 route 2001:DB8:2::/64 2001:DB8:1::2.',               'ipv6 route 2001:DB8:2::/64 2001:DB8:1::2', '{"type":"command","contains":"ipv6 route 2001:db8:2::/64"}'::jsonb, 10),
  (3, 'Verify',                 'show ipv6 route to confirm the prefix appeared.',         'show ipv6 route',     '{"type":"command","contains":"show ipv6 route"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-floating-static')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Install backup with AD 200',  'ip route 192.168.2.0 255.255.255.0 10.0.0.2 200.', 'ip route 192.168.2.0 255.255.255.0 10.0.0.2 200', '{"type":"command","contains":"255.255.255.0 10.0.0.2 200"}'::jsonb, 10),
  (2, 'Verify OSPF still wins',      'show ip route — OSPF (O) should still be preferred.', 'show ip route',                                  '{"type":"command","contains":"show ip route"}'::jsonb, 10),
  (3, 'Save the running config',     'copy running-config startup-config.',                 'copy running-config startup-config',             '{"type":"command","contains":"copy running"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-ospfv2-single-area')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Start OSPF process 1',       'router ospf 1.',                                                  'router ospf 1',              '{"type":"command","contains":"router ospf 1"}'::jsonb, 10),
  (2, 'Advertise networks',         'network 192.168.1.0 0.0.0.255 area 0.',                           'network 192.168.1.0 0.0.0.255 area 0', '{"type":"command","contains":"network 192.168.1.0 0.0.0.255 area 0"}'::jsonb, 10),
  (3, 'Verify neighbours',          'show ip ospf neighbor — expect FULL state.',                      'show ip ospf neighbor',      '{"type":"command","contains":"show ip ospf neighbor"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-ospf-dr-bdr')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'List OSPF neighbours',  'show ip ospf neighbor.',         'show ip ospf neighbor',  '{"type":"command","contains":"show ip ospf neighbor"}'::jsonb, 10),
  (2, 'Read OSPF process info','show ip ospf — confirm area 0.', 'show ip ospf',           '{"type":"command","contains":"show ip ospf"}'::jsonb, 10),
  (3, 'Inspect routes',        'show ip route ospf to see learned prefixes.', 'show ip route', '{"type":"command","contains":"show ip route"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-fhrp-hsrp')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Enter Gi0/0',           'interface GigabitEthernet0/0.',                       'interface GigabitEthernet0/0', '{"type":"command","contains":"interface gigabitethernet0/0"}'::jsonb, 10),
  (2, 'Set HSRP virtual IP',   'standby 1 ip 192.168.1.254.',                          'standby 1 ip 192.168.1.254',   '{"type":"command","contains":"standby 1 ip 192.168.1.254"}'::jsonb, 10),
  (3, 'Make this router primary','standby 1 priority 110 / standby 1 preempt.',        'standby 1 priority 110',       '{"type":"command","contains":"standby 1 priority 110"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-static-nat')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Add static NAT mapping', 'ip nat inside source static 192.168.1.10 203.0.113.10.', 'ip nat inside source static 192.168.1.10 203.0.113.10', '{"type":"command","contains":"ip nat inside source static 192.168.1.10 203.0.113.10"}'::jsonb, 10),
  (2, 'Mark inside on Gi0/0',   'interface Gi0/0 → ip nat inside.',                       'ip nat inside',             '{"type":"command","contains":"ip nat inside"}'::jsonb, 10),
  (3, 'Verify translations',    'show ip nat translations.',                              'show ip nat translations',  '{"type":"command","contains":"show ip nat translations"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-pat-overload')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Permit inside hosts',     'access-list 1 permit 192.168.1.0 0.0.0.255.',                 'access-list 1 permit 192.168.1.0 0.0.0.255', '{"type":"command","contains":"access-list 1 permit 192.168.1.0 0.0.0.255"}'::jsonb, 10),
  (2, 'Configure PAT overload',  'ip nat inside source list 1 interface Gi0/1 overload.',       'ip nat inside source list 1 interface GigabitEthernet0/1 overload', '{"type":"command","contains":"ip nat inside source list 1 interface gigabitethernet0/1 overload"}'::jsonb, 10),
  (3, 'Verify NAT activity',     'show ip nat translations.',                                    'show ip nat translations',                  '{"type":"command","contains":"show ip nat translations"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-ntp-client-server')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Point at an NTP server', 'ntp server 132.163.97.1.',     'ntp server 132.163.97.1', '{"type":"command","contains":"ntp server 132.163.97.1"}'::jsonb, 10),
  (2, 'Check NTP status',       'show ntp status.',              'show ntp status',         '{"type":"command","contains":"show ntp"}'::jsonb, 10),
  (3, 'Read the clock',         'show clock to confirm sync.',   'show clock',              '{"type":"command","contains":"show clock"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-dhcp-relay')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Enter VLAN 10 SVI / Gi0/0', 'interface GigabitEthernet0/0.',                          'interface GigabitEthernet0/0', '{"type":"command","contains":"interface gigabitethernet0/0"}'::jsonb, 10),
  (2, 'Forward DHCP to server',    'ip helper-address 10.0.0.50.',                            'ip helper-address 10.0.0.50',  '{"type":"command","contains":"ip helper-address 10.0.0.50"}'::jsonb, 10),
  (3, 'Verify config',             'show running-config interface GigabitEthernet0/0.',       'show running-config',          '{"type":"command","contains":"show running"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-syslog-severity')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Add a logging host',  'logging host 10.0.0.100.',         'logging host 10.0.0.100',  '{"type":"command","contains":"logging host 10.0.0.100"}'::jsonb, 10),
  (2, 'Set severity to 6',   'logging trap informational.',      'logging trap informational','{"type":"command","contains":"logging trap"}'::jsonb, 10),
  (3, 'Verify',              'show running-config | include logging.', 'show running-config', '{"type":"command","contains":"show running"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-ssh-remote-access')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Generate RSA keys',          'crypto key generate rsa.',                              'crypto key generate rsa',  '{"type":"command","contains":"crypto key generate rsa"}'::jsonb, 10),
  (2, 'Enter VTY lines',            'line vty 0 4.',                                          'line vty 0 4',             '{"type":"command","contains":"line vty 0 4"}'::jsonb, 10),
  (3, 'Restrict to SSH',            'transport input ssh.',                                   'transport input ssh',      '{"type":"command","contains":"transport input ssh"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-device-hardening')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Set the hostname',       'hostname SHADOWX-R1.',          'hostname SHADOWX-R1',           '{"type":"command","contains":"hostname"}'::jsonb, 10),
  (2, 'Add an admin user',      'username admin secret StrongPass!23.', 'username admin secret', '{"type":"command","contains":"username admin"}'::jsonb, 10),
  (3, 'Encrypt all passwords',  'service password-encryption.',   'service password-encryption',   '{"type":"command","contains":"service password-encryption"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-acl-extended')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Create the named ACL',   'ip access-list extended WEB-IN.',                       'ip access-list extended WEB-IN',     '{"type":"command","contains":"ip access-list extended web-in"}'::jsonb, 10),
  (2, 'Permit web traffic',     'permit tcp any host 192.168.1.50 eq 80.',                'permit tcp any host 192.168.1.50 eq 80', '{"type":"command","contains":"permit tcp any host 192.168.1.50 eq 80"}'::jsonb, 10),
  (3, 'Verify ACL hits',        'show access-lists.',                                     'show access-lists',                  '{"type":"command","contains":"show access-lists"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-port-security')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Enter Gi0/2',                  'interface GigabitEthernet0/2.',                                'interface GigabitEthernet0/2',            '{"type":"command","contains":"interface gigabitethernet0/2"}'::jsonb, 10),
  (2, 'Enable port-security',         'switchport port-security.',                                    'switchport port-security',                '{"type":"command","contains":"switchport port-security"}'::jsonb, 10),
  (3, 'Limit MACs + violation action','switchport port-security maximum 2 / violation shutdown.',    'switchport port-security violation shutdown','{"type":"command","contains":"port-security violation shutdown"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-dhcp-snooping-dai')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Enable DHCP snooping globally', 'ip dhcp snooping.',                          'ip dhcp snooping',           '{"type":"command","contains":"ip dhcp snooping"}'::jsonb, 10),
  (2, 'Enable on VLAN 10',             'ip dhcp snooping vlan 10.',                  'ip dhcp snooping vlan 10',   '{"type":"command","contains":"ip dhcp snooping vlan 10"}'::jsonb, 10),
  (3, 'Trust the uplink',              'interface Gi0/24 → ip dhcp snooping trust.', 'ip dhcp snooping trust',     '{"type":"command","contains":"ip dhcp snooping trust"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-aaa-radius')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Enable AAA',         'aaa new-model.',                                                          'aaa new-model',                          '{"type":"command","contains":"aaa new-model"}'::jsonb, 10),
  (2, 'Add the RADIUS server','radius-server host 10.0.0.40 key SuperSecret.',                         'radius-server host 10.0.0.40',           '{"type":"command","contains":"radius-server host 10.0.0.40"}'::jsonb, 10),
  (3, 'Build the auth list',  'aaa authentication login default group radius local.',                   'aaa authentication login default group radius local','{"type":"command","contains":"aaa authentication login default group radius local"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-wpa2-psk-wlan')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Define the SSID',         'dot11 ssid shadowx-corp.',                                'dot11 ssid shadowx-corp',                '{"type":"command","contains":"dot11 ssid shadowx-corp"}'::jsonb, 10),
  (2, 'Set authentication',      'authentication open / authentication key-management wpa.', 'authentication key-management wpa',     '{"type":"command","contains":"key-management wpa"}'::jsonb, 10),
  (3, 'Map to a VLAN',           'vlan 10 (in WLAN config) — bind SSID to VLAN.',           'vlan 10',                                '{"type":"command","contains":"vlan 10"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-rest-api-postman')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Read the device version (concept)','Concept walk: a REST GET to /restconf/data/Cisco-IOS-XE-native:native/version returns the IOS version.', 'show version', '{"type":"command","contains":"show version"}'::jsonb, 10),
  (2, 'Show the running-config (concept)','Concept walk: REST GET /restconf/data/Cisco-IOS-XE-native:native is equivalent to show running-config.', 'show running-config', '{"type":"command","contains":"show running"}'::jsonb, 10),
  (3, 'Show interfaces (concept)',        'Concept walk: REST GET /data/ietf-interfaces:interfaces is equivalent to show ip interface brief.',     'show ip interface brief','{"type":"command","contains":"show ip int"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-json-parsing')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Inspect a config concept',  'show version — REST equivalents would return JSON with hostname, version and uptime keys.', 'show version', '{"type":"command","contains":"show version"}'::jsonb, 10),
  (2, 'Inspect a list concept',    'show ip interface brief — the REST equivalent returns a JSON array of interface objects.',  'show ip interface brief', '{"type":"command","contains":"show ip int"}'::jsonb, 10),
  (3, 'Inspect a routing concept', 'show ip route — REST returns nested JSON: routes[].nexthop, prefix, protocol.',              'show ip route', '{"type":"command","contains":"show ip route"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-ansible-playbook-tour')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Mirror a "set hostname" task', 'In IOS this is just hostname SHADOWX-R1; in Ansible the ios_config module does the same.', 'hostname SHADOWX-R1', '{"type":"command","contains":"hostname"}'::jsonb, 10),
  (2, 'Mirror a "configure interface" task', 'Ansible would push interface Gi0/0 + ip address; do it manually here.',                'interface GigabitEthernet0/0', '{"type":"command","contains":"interface gigabitethernet0/0"}'::jsonb, 10),
  (3, 'Mirror a "save config" task',  'Ansible playbook ends with copy run start; run it here.',                                      'copy running-config startup-config', '{"type":"command","contains":"copy running"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='ccna-sdn-controller-tour')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'See the data plane',    'show mac address-table — this is the L2 forwarding state SDN controllers program.', 'show mac address-table', '{"type":"command","contains":"show mac"}'::jsonb, 10),
  (2, 'See the control plane', 'show ip route — this is the L3 control-plane decision SDN northbound APIs query.',  'show ip route',          '{"type":"command","contains":"show ip route"}'::jsonb, 10),
  (3, 'See neighbours',        'show cdp neighbors — controllers use LLDP/CDP to build topology overlays.',          'show cdp neighbors',    '{"type":"command","contains":"show cdp"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;
