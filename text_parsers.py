# text_parsers.py
# Simple markdown parser extracting incomes and expenses using regex heuristics.

import re
from typing import Dict, Any

_money_rx = re.compile(r'₹?\s?([0-9\.,]+)\s?(?:INR|Rs\.?|rs\.?)?', re.I)

def _to_number(s: str):
    s = s.replace(',', '').strip()
    try:
        return float(s)
    except:
        return None

def parse_markdown_income_expense(md: str) -> Dict[str, Any]:
    lines = [l.strip() for l in md.splitlines() if l.strip()]
    incomes = []
    expenses = []
    for l in lines:
        low = l.lower()
        # heuristics: lines containing income/salary/revenue -> income
        if any(k in low for k in ('income', 'salary', 'revenue', 'earning', 'gross')):
            m = _money_rx.search(l)
            if m:
                incomes.append({'line': l, 'value': _to_number(m.group(1))})
        # heuristics: lines containing expense, rent, bills, emi
        if any(k in low for k in ('expense', 'rent', 'bill', 'emi', 'loan', 'utility', 'grocery')):
            m = _money_rx.search(l)
            if m:
                expenses.append({'line': l, 'value': _to_number(m.group(1))})
        # also handle bullet lines like "- Salary: ₹50,000"
        if ':' in l and not any(k in low for k in ('income','expense','rent','salary')):
            # try to capture amounts generically
            m = _money_rx.search(l)
            if m:
                # guess category by keywords
                cat = 'other'
                if any(k in low for k in ('salary','income')):
                    cat='income'
                elif any(k in low for k in ('rent','bill','emi','loan','utility','grocery')):
                    cat='expense'
                else:
                    cat = 'expense' if len(expenses) < len(incomes) else 'income'
                (incomes if cat=='income' else expenses).append({'line': l, 'value': _to_number(m.group(1))})

    total_income = sum(i['value'] for i in incomes if i['value'])
    total_expense = sum(e['value'] for e in expenses if e['value'])
    monthly_cashflow = total_income - total_expense

    return {
        'incomes': incomes,
        'expenses': expenses,
        'total_income': total_income,
        'total_expense': total_expense,
        'monthly_cashflow': monthly_cashflow
    }
