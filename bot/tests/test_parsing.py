from bot.parsing import parse_quick


def test_parse_quick():
    amount, category, when = parse_quick("2k food")
    assert amount == 2000
    assert category == "Food"
