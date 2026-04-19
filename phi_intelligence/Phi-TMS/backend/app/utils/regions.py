"""Regional configurations"""
from typing import Literal, Dict, Any

RegionCode = Literal["UK", "INDIA", "BOTH"]

REGION_CONFIGS: Dict[RegionCode, Dict[str, Any]] = {
    "UK": {
        "currency": "GBP",
        "currency_symbol": "£",
        "date_format": "DD/MM/YYYY",
        "min_annual_leave": 28,  # Including bank holidays
        "max_weekly_hours": 48,
        "work_week": [1, 2, 3, 4, 5],  # Mon-Fri
        "standard_work_hours": 8,
        "overtime_multiplier": 1.5,
        "tax_system": "PAYE",
        "social_insurance": "NI",
    },
    "INDIA": {
        "currency": "INR",
        "currency_symbol": "₹",
        "date_format": "DD/MM/YYYY",
        "earned_leave": 18,
        "casual_leave": 12,
        "sick_leave": 15,
        "work_week": [1, 2, 3, 4, 5, 6],  # Mon-Sat (configurable)
        "standard_work_hours": 8,
        "overtime_multiplier": 2.0,
        "tax_system": "TDS",
        "social_insurance": "PF/ESI",
        "provident_fund_rate": 0.12,  # 12% of basic
    },
    "BOTH": {
        "currency": "GBP",
        "currency_symbol": "£",
        "date_format": "DD/MM/YYYY",
        "work_week": [1, 2, 3, 4, 5],
        "standard_work_hours": 8,
    },
}


def get_region_config(region: RegionCode) -> Dict[str, Any]:
    """Get region configuration"""
    return REGION_CONFIGS.get(region, REGION_CONFIGS["UK"])

