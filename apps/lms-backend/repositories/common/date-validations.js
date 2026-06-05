const { AccrualApplicableOn } = require("../../models/tenants/leave/enum/accrual-applicable-on-enum");
const { AccrualPeriod } = require("../../models/tenants/leave/enum/accrual-period-enum");

exports.isEndOfMonth = () => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return today.getDate() === lastDayOfMonth.getDate();
}

exports.isStartOfMonth = () => {
    const today = new Date();
    return today.getDate() === 1;
}



exports.isAccrualPeriodEnded = (joinDate, accrualPeriod, accrualApplicableOn) => {
    const joinDateObj = new Date(joinDate);
    const currentDateObj = new Date();

    const setToMidnight = (date) => {
        date.setHours(0, 0, 0, 0);
        return date;
    };

    const calculateStartOfPeriod = (joinDateObj, accrualPeriod, accrualApplicableOn) => {
        const year = joinDateObj.getFullYear();
        const month = joinDateObj.getMonth();

        switch (accrualPeriod) {
            case AccrualPeriod.ENUM.MONTHLY:
                if (accrualApplicableOn === AccrualApplicableOn.ENUM.DATE_OF_JOINING) {
                    return new Date(year, month, joinDateObj.getDate());
                } else if (accrualApplicableOn === AccrualApplicableOn.ENUM.START) {
                    return new Date(year, month, 1);
                } else if (accrualApplicableOn === AccrualApplicableOn.ENUM.END) {
                    return new Date(year, month + 1, 0);
                }
                break;
            case AccrualPeriod.ENUM.QUARTERLY:
                const quarter = Math.floor(month / 3);
                const quarterStartMonth = quarter * 3;
                if (accrualApplicableOn === AccrualApplicableOn.ENUM.DATE_OF_JOINING) {
                    return new Date(year, quarterStartMonth, joinDateObj.getDate());
                } else if (accrualApplicableOn === AccrualApplicableOn.ENUM.START) {
                    return new Date(year, quarterStartMonth, 1);
                } else if (accrualApplicableOn === AccrualApplicableOn.ENUM.END) {
                    return new Date(year, quarterStartMonth + 3, 0);
                }
                break;
            case AccrualPeriod.ENUM.HALF_YEARLY:
                const halfYear = Math.floor(month / 6);
                const halfYearStartMonth = halfYear * 6;
                if (accrualApplicableOn === AccrualApplicableOn.ENUM.DATE_OF_JOINING) {
                    return new Date(year, halfYearStartMonth, joinDateObj.getDate());
                } else if (accrualApplicableOn === AccrualApplicableOn.ENUM.START) {
                    return new Date(year, halfYearStartMonth, 1);
                } else if (accrualApplicableOn === AccrualApplicableOn.ENUM.END) {
                    return new Date(year, halfYearStartMonth + 3, 0);
                }
            case AccrualPeriod.ENUM.HALF_YEARLY:
                const annually = Math.floor(month / 6);
                const annuallyStartMonth = halfYear * 6;
                if (accrualApplicableOn === AccrualApplicableOn.ENUM.DATE_OF_JOINING) {
                    return new Date(year + 1, annuallyStartMonth, joinDateObj.getDate());
                } else if (accrualApplicableOn === AccrualApplicableOn.ENUM.START) {
                    return new Date(year + 1, annuallyStartMonth, 1);
                } else if (accrualApplicableOn === AccrualApplicableOn.ENUM.END) {
                    return new Date(year + 1, annuallyStartMonth + 3, 0);
                }
            default:
                throw new Error('Invalid accrual period');
        }
    };

    const startOfPeriod = calculateStartOfPeriod(joinDateObj, accrualPeriod, accrualApplicableOn);

    let endOfPeriod;
    switch (accrualPeriod) {
        case AccrualPeriod.ENUM.MONTHLY:
            endOfPeriod = new Date(startOfPeriod.getFullYear(), startOfPeriod.getMonth() + 1, 0);
            break;
        case AccrualPeriod.ENUM.QUARTERLY:
            endOfPeriod = new Date(startOfPeriod.getFullYear(), startOfPeriod.getMonth() + 3, 0);
            break;
        case AccrualPeriod.ENUM.HALF_YEARLY:
            endOfPeriod = new Date(startOfPeriod.getFullYear(), startOfPeriod.getMonth() + 6, 0);
            break;
        case AccrualPeriod.ENUM.YEARLY:
            endOfPeriod = new Date(startOfPeriod.getFullYear() + 1, startOfPeriod.getMonth(), 0);
            break;
        default:
            throw new Error('Invalid accrual period');
    }

    return setToMidnight(currentDateObj) === setToMidnight(endOfPeriod);
}

exports.getWorkingDays = (start_date, end_date) => {
    const endDate = new Date(end_date);
    let count = 0;
    const currentDate = new Date(start_date);

    while (endDate >= currentDate) {
        const day = currentDate.getDay();
        if (day !== 0 && day !== 6) {
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1); 
    }
    
    return count;
}

exports.generateMonthRange=(date_range)=> {
    const start = new Date(date_range[0]);
    const end = new Date(date_range[1]);
    const months = [];

    while (start <= end) {
        months.push(start.toISOString().slice(0, 7)); 
        start.setMonth(start.getMonth() + 1);
    }

    return months;
}

exports.generateDateRange=([startDate, endDate]) =>{
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    let current = start;

    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]); 
        current.setDate(current.getDate() + 1);
    }

    return dates;
}




