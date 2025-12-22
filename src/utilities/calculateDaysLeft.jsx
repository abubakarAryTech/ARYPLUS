import { differenceInDays, parse } from 'date-fns';


export const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return 'Expired'; // Handle case where expiry date is not available

    // Parse the expiry date string to a Date object
    const expiry = new Date(expiryDate);
    const today = new Date(); // Current date

    // Calculate the difference in days
    const daysLeft = differenceInDays(expiry, today);

    // Return appropriate text based on days left
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
};