export const formatDateToDDMMYYYY = (date:Date) => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return formatter.format(new Date(date));
  }

  