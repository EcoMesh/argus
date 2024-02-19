import netifaces as ni


def get_lan_ip():
    interfaces = ni.interfaces()
    for interface in interfaces:
        if interface != "lo":  # Exclude loopback interface
            addrs = ni.ifaddresses(interface)
            if ni.AF_INET in addrs:
                ip = addrs[ni.AF_INET][0]["addr"]
                if not ip.startswith("127.") and not ip.startswith("169.254."):
                    return ip
    raise Exception("No LAN IP found")
