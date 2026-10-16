CATALOG = [
    dict(
        sku="KEY-01",
        name="Studio Keyboard",
        category="keyboard",
        cents=5900,
        currency="USD",
        merchant="Guard Demo Store",
        stock=20,
        attributes=["Wireless", "Quiet keys", "USB-C charging"],
    ),
    dict(
        sku="KEY-02",
        name="Compact Keyboard",
        category="keyboard",
        cents=3500,
        currency="USD",
        merchant="Guard Demo Store",
        stock=20,
        attributes=["Wired", "Compact layout", "Quiet keys"],
    ),
    dict(
        sku="AUD-01",
        name="Focus Headphones",
        category="headphones",
        cents=8900,
        currency="USD",
        merchant="Guard Demo Store",
        stock=20,
        attributes=["Wireless", "Noise cancelling", "30-hour battery"],
    ),
    dict(
        sku="AUD-02",
        name="Desk Headset",
        category="headphones",
        cents=4200,
        currency="USD",
        merchant="Guard Demo Store",
        stock=20,
        attributes=["Wired", "Boom microphone", "Lightweight"],
    ),
    dict(
        sku="HUB-01",
        name="Workspace Hub",
        category="hub",
        cents=4900,
        currency="USD",
        merchant="Guard Demo Store",
        stock=20,
        attributes=["USB-C", "HDMI", "Four ports"],
    ),
    dict(
        sku="MON-01",
        name="Clarity Monitor",
        category="monitor",
        cents=18900,
        currency="USD",
        merchant="Guard Demo Store",
        stock=20,
        attributes=["24-inch", "1080p", "IPS panel"],
    ),
]


def product(sku):
    return next((p for p in CATALOG if p["sku"] == sku), None)


def policy(p, budget, quantity=1, quoted=None):
    return {
        "valid_sku": p is not None,
        "approved_merchant": bool(p and p["merchant"] == "Guard Demo Store"),
        "allowed_category": bool(
            p and p["category"] in {"keyboard", "headphones", "hub", "monitor"}
        ),
        "available": bool(p and p["stock"] >= quantity),
        "within_budget": bool(p and p["cents"] * quantity <= budget),
        "price_unchanged": bool(
            p and (quoted is None or p["cents"] * quantity == quoted)
        ),
    }
