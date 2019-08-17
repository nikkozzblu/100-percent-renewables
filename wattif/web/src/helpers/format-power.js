export function formatPower(number, baseUnit = 1e6, monetary = false) {
    number *= baseUnit;

    if (number > 1e15 && !monetary)
        return Math.round(number / 1e12) + 'T'

    if (number > 1e12 && !monetary)
        return (number / 1e12).toPrecision(4) + 'T'

    if (number > 1e9)
        if (monetary)
            return Math.round(number / 1e9).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' Mds'
        else
            return (number / 1e9).toPrecision(4) + 'G'

    if (number > 1e6)
        return (number / 1e6).toPrecision(4) + 'M'

    if (number > 1e3)
        return (number / 1e3).toPrecision(4) + 'k'

    return number.toPrecision(4)
}