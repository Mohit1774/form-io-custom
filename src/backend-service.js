const url = 'https://formio-ed15.restdb.io/rest/form-schema';
const apiKey = "6805d3ce72702cd15bb3d210";

class ApiService {

    async fetchData (id) {
        try {
            const response = await fetch(`${url}/${id}`, {
                method: 'GET',
                headers: {
                    "content-type": "application/json",
                    "x-apikey": apiKey,
                    "cache-control": "no-cache"
                }
            });
        
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const data = await response.json();
            console.log("Fetched Data:", data);
            return data;
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    async postData (schema) { // Replace with your actual endpoint
    
        const payload = {
            schemajson: schema
        }
    
        try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                "x-apikey": apiKey,
                "cache-control": "no-cache"
            },
            body: (JSON.stringify(payload)).toString()
        });
    
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const result = await response.json();
        console.log('Server response:', result);
        return result;
    
        } catch (error) {
            console.error('Error in POST request:', error);
        }
    }
}

const apiService = new ApiService();
export default apiService;