import { NextRequest } from "next/server";

interface NasaWindResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
  properties: {
    parameter: {
      WS10M: {
        [date: string]: number;
      };
    };
  };
  header: {
    title: string;
    api: {
      version: string;
      name: string;
    };
    sources: string[];
    fill_value: number;
    time_standard: string;
    start: string;
    end: string;
  };
  messages: any[];
  parameters: {
    WS10M: {
      units: string;
      longname: string;
    };
  };
  times: {
    data: number;
    process: number;
  };
}

export async function POST(req: NextRequest) {
  console.log('NASA Wind API route called');
  
  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { latitude, longitude, startDate, endDate } = body;

    if (!latitude || !longitude || !startDate || !endDate) {
      console.log('Missing required parameters');
      return Response.json(
        { error: "latitude, longitude, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    // Convert dates to YYYYMMDD format expected by NASA API
    const formatDateForNasa = (dateStr: string): string => {
      console.log('Formatting date:', dateStr);
      // Handle both DD-MM-YYYY and YYYY-MM-DD formats
      const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
      const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;
      
      if (ddmmyyyy.test(dateStr)) {
        const [, d, m, y] = dateStr.match(ddmmyyyy)!;
        const result = `${y}${m}${d}`;
        console.log('DD-MM-YYYY format detected, converted to:', result);
        return result;
      } else if (yyyymmdd.test(dateStr)) {
        const [, y, m, d] = dateStr.match(yyyymmdd)!;
        const result = `${y}${m}${d}`;
        console.log('YYYY-MM-DD format detected, converted to:', result);
        return result;
      }
      throw new Error(`Invalid date format: ${dateStr}. Expected DD-MM-YYYY or YYYY-MM-DD`);
    };

    let formattedStartDate: string;
    let formattedEndDate: string;
    
    try {
      formattedStartDate = formatDateForNasa(startDate);
      formattedEndDate = formatDateForNasa(endDate);
    } catch (dateError: any) {
      console.error('Date formatting error:', dateError);
      return Response.json(
        { error: dateError.message },
        { status: 400 }
      );
    }

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?start=${formattedStartDate}&end=${formattedEndDate}&latitude=${latitude}&longitude=${longitude}&community=ag&parameters=WS10M&format=json&header=true`;
    
    console.log('NASA API URL:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let data: NasaWindResponse;
    try {
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('NASA API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('NASA API error:', errorText);
        return Response.json(
          { error: `NASA API request failed: ${response.status} ${errorText}` },
          { status: response.status }
        );
      }

      data = await response.json();
      console.log('NASA API response data:', JSON.stringify(data, null, 2));
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('NASA API request timed out');
        return Response.json(
          { error: 'NASA API request timed out' },
          { status: 408 }
        );
      }
      throw fetchError; // Re-throw other fetch errors
    }

    console.log('NASA API response data:', JSON.stringify(data, null, 2));

    if (!data.properties?.parameter?.WS10M) {
      console.error('No WS10M data in response:', data);
      return Response.json(
        { error: "No wind speed data available for the specified location and date range" },
        { status: 404 }
      );
    }

    const windData = data.properties.parameter.WS10M;
    console.log('Wind data extracted:', windData);
    
    const windSpeeds = Object.entries(windData)
      .filter(([date, speed]) => speed !== -999) // Filter out fill values
      .map(([date, speed]) => ({
        date,
        windSpeed: Number(speed)
      }));

    console.log('Processed wind speeds:', windSpeeds);

    // Calculate average wind speed
    const avgWindSpeed = windSpeeds.length > 0 
      ? windSpeeds.reduce((sum, item) => sum + item.windSpeed, 0) / windSpeeds.length
      : 0;

    const result = {
      success: true,
      data: windSpeeds,
      averageWindSpeed: Number(avgWindSpeed.toFixed(2)),
      unit: data.parameters?.WS10M?.units || "m/s"
    };

    console.log('Final result:', result);
    return Response.json(result);

  } catch (error: any) {
    console.error('NASA Wind API error:', error);
    return Response.json(
      { error: `Internal server error: ${error.message || error}` },
      { status: 500 }
    );
  }
}