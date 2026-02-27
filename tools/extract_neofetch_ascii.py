import re
import sys
import urllib.request


def fetch_neofetch() -> str:
    url = "https://raw.githubusercontent.com/dylanaraps/neofetch/master/neofetch"
    with urllib.request.urlopen(url, timeout=20) as res:
        return res.read().decode("utf-8", "ignore")


def get_distro_ascii_function(source: str) -> str:
    start = source.find("get_distro_ascii() {")
    if start == -1:
        raise RuntimeError("get_distro_ascii() not found")
    return source[start:]


def strip_color_tokens(art: str) -> str:
    art = re.sub(r"\$\{c\d+\}", "", art)
    return art.rstrip("\n")


def extract_art(func_src: str, label_regex: str) -> str:
    m = re.search(label_regex, func_src, re.M)
    if not m:
        raise RuntimeError(f"label not found: {label_regex}")
    start = m.end()
    heredoc = re.search(r"read -rd '' ascii_data <<'EOF'\n([\s\S]*?)\n\s*EOF", func_src[start:])
    if not heredoc:
        raise RuntimeError("ascii_data heredoc not found after label")
    return strip_color_tokens(heredoc.group(1))


def list_labels(func: str) -> list[str]:
    labels: list[str] = []
    for line in func.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("#"):
            continue
        if stripped.startswith("case ") or stripped == "esac":
            continue
        if stripped.endswith(")") and "<<" not in stripped and ";;" not in stripped:
            labels.append(stripped)
    return labels


def main() -> int:
    src = fetch_neofetch()
    func = get_distro_ascii_function(src)

    if "--list" in sys.argv:
        for label in list_labels(func):
            print(label)
        return 0

    targets: list[tuple[str, str]] = [
        ("windows", r'^\s*"Windows"\*\)\s*$'),
        ("macos", r'^\s*"mac"\* \| "Darwin"\)\s*$'),
        ("android", r'^\s*"Android"\*\)\s*$'),
        ("linux", r'^\s*"Linux"\)\s*$'),
        ("ubuntu", r'^\s*"Ubuntu"\* \| "i3buntu"\*\)\s*$'),
        ("debian", r'^\s*"Debian"\*\)\s*$'),
        ("fedora", r'^\s*"Fedora"\*\)\s*$'),
        ("arch", r'^\s*"Arch"\*\)\s*$'),
        ("manjaro", r'^\s*"Manjaro"\*\)\s*$'),
        ("linuxmint", r'^\s*"Linux Mint"\* \| "LinuxMint"\* \| "mint"\*\)\s*$'),
        ("popos", r'^\s*"Pop!_OS"\* \| "popos"\* \| "pop_os"\*\)\s*$'),
        ("opensuse", r'^\s*"openSUSE"\* \| "open SUSE"\* \| "SUSE"\*\)\s*$'),
    ]

    for name, regex in targets:
        try:
            art = extract_art(func, regex)
        except Exception as e:
            print(f"### {name}\nMISS: {e}\n", file=sys.stderr)
            continue
        print(f"### {name}\n{art}\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
