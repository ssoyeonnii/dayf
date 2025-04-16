// GoogleAPI 공휴일 로직
export async function HolidayUtils(year, apiKey) {
  const calendarId = "ko.south_korea#holiday@group.v.calendar.google.com";

  const timeMin = `${year}-01-01T00:00:00Z`;
  const timeMax = `${year}-12-31T23:59:59Z`;

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url);
  const data = await response.json();

  const holidays = data.items.map((event) => ({
    date: event.start.date,
    title: event.summary,
  }));

  return holidays;
}
