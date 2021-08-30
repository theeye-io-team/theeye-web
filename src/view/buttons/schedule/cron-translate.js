// TODO: Handle positive offsets
export default function translateCron(cron, offset) {
    let a = cron.split(" ")
    for (let i = 0; i < a.length; i++) {
        if (!isNaN(parseFloat(a[i])))
            a[i] = parseFloat(a[i])
    }
    if (a.length == 5 && !isNaN(parseFloat(a[1]))) {
        a[1] = a[1] + parseFloat(offset)
        if (a[1] < 0) {
            a[1] = a[1] + 24
            if (!isNaN(parseFloat(a[2]))) {
                a[2]--
                if (a[2] < 1) {
                    switch (a[3]) {
                        case 3:
                            a[3] = 2
                            a[2] = 28
                            break
                        case 1:
                            a[3] = 12
                            a[2] = 30
                            break
                        case 2, 4, 6, 8, 10, 12:
                            a[3]--
                            a[2] = 31
                            break
                        case 3, 5, 7, 9, 11:
                            a[3]--
                            a[2] = 30
                            break
                        default:
                            // TODO: Maybe handle months with different lenghts, 
                            // would require multiple CRON job definitions ._.
                            a[2] = 31
                            break
                    }
                }
            }
            if (!isNaN(parseFloat(a[4]))) {
                a[4]--
                if (a[4] < 0) a[4] = 6
            }
        }
    }
    else if (a.length == 6 && !isNaN(parseFloat(a[2]))) {
        a[2] = a[2] - 3
        if (a[2] < 0) {
            a[2] = a[2] + 24
            if (!isNaN(parseFloat(a[3]))) {
                a[3]--
                if (a[3] < 1) {
                    switch (a[4]) {
                        case 3:
                            a[4] = 2
                            a[3] = 28
                            break
                        case 2, 4, 6, 8, 10, 12:
                            a[4]--
                            a[3] = 31
                        case 3, 5, 7, 9, 11:
                            a[4]--
                            a[3] = 30
                        case 1:
                            a[4] = 12
                            a[3] = 30
                        default:
                            // TODO: Maybe handle months with different lenghts, 
                            // would require multiple CRON job definitions ._.
                            a[3] = 31
                            break
                    }
                }
            }
            if (!isNaN(parseFloat(a[5]))) {
                a[5]--
                if (a[5] < 0) a[5] = 6
            }
        }
    }
    return a.join(" ")
}