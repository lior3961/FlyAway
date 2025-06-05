export const parseOpenAIResponse = (response) => {
  try {

    let raw = response;

    // If it's a string, try sanitizing it
    if (typeof response === 'string') {
      // Remove invalid control characters and fix common formatting issues
      raw = response
        .replace(/\\n/g, "\\n")                       // ensure escaped newlines
        .replace(/\\'/g, "'")                         // unescape single quotes
        .replace(/“|”/g, '"')                         // fancy quotes → straight
        .replace(/‘|’/g, "'");                        // fancy apostrophes → normal
    }

    const parsedResponse = typeof raw === 'string' ? JSON.parse(raw) : raw;
    
    return {
      summary: parsedResponse.Summary,
      
      hotels: parsedResponse.Hotels?.map(hotel => ({
        name: hotel.name,
        features: hotel.features,
        link: hotel.link
      })) || [],

      attractions: Object.keys(parsedResponse.Attractions || {}).map(genre_category => ({
        category: genre_category,
        recommended_attractions: (parsedResponse.Attractions[genre_category] || []).map(attr => ({
          name: attr.name,
          description: attr.description
        }))
      })),
      
      restaurants: Object.keys(parsedResponse.Restaurants || {}).map(restaurant_category => ({
        category: restaurant_category,
        recommended_restaurants: (parsedResponse.Restaurants[restaurant_category] || []).map(rest => ({
          name: rest.name,
          cuisine: rest.cuisine,
          additionalInfo: rest.additional_info
        }))
      })),

      costs: parsedResponse.Costs,

      dates: parsedResponse.Dates,

      schedule: Array.isArray(parsedResponse.Schedule)
        ? parsedResponse.Schedule.map((dayObj, index) => {
            const [dayKey, schedule] = Object.entries(dayObj)[0];
            return {
              day: dayKey,
              morning: schedule.morning,
              noon: schedule.noon,
              evening: schedule.evening
            };
          })
        : [] ,
    };
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    return null;
  }
};
