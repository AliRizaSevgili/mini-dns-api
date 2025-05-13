Mini DNS API – Backend Developer Assessment

###-Project Overview-###

 -This project implements a simplified yet realistic DNS API, supporting A and CNAME records while enforcing real-world DNS constraints such as record exclusivity, alias resolution chaining, and loop detection.

###-Features-###
 -A Record support (multiple IPs per hostname)

 -CNAME support (only one allowed, exclusive to other record types)

 -CNAME chaining resolution

 -Loop detection for CNAME references

 -Comprehensive input validation and error messaging

 -Asynchronous DNS query logging using BullMQ

 -In-memory caching for faster hostname resolution (Good-to-Have)

###- Setup & Run-###

 #-Requirements-#
  -Node.js (v18 or newer)
  -Redis (v5+ supported; 6.2+ recommended)
  -npm

 #-Installation-#
  -git clone <repo-url>
  -cd backend-dns-api
  -npm install
 
 #-Start the app-#
  -npm run dev     // Starts the API server
  -node src/jobs/logWorker.js   // Starts the async  logging worker


###-API Endpoints-###

  POST /api/dns 
  Adds a DNS record.

  Request Body:

 { "type": "A", "hostname": "example.com", "value": "192.168.1.1" }

  GET /api/dns/:hostname  //Resolves a hostname to its associated IPs. Supports chained CNAMEs.

  GET /api/dns/:hostname/records  //Lists all DNS records for the given hostname.

  DELETE /api/dns/:hostname?type=A&value=...   //Deletes a specific DNS record based on type and value.



###-Asynchronous Logging-###
 -Each GET /api/dns/:hostname request is logged asynchronously:
 Logs are queued via BullMQ
 
 A background worker (logWorker.js) processes and outputs logs
 
 Logged data includes hostname, result, and timestamp
 
 -Tech: BullMQ + ioredis


###-Caching-###
 -Hostnames are cached after successful resolution

 -If queried again, they are served from cache without reprocessing the chain

 -Boosts performance and reduces memory access


############################################################################################################
  
-AI Usage Disclosure-

-During the development of this project, I personally wrote the implementation code and manually structured the entire system, including routes, controllers, models, and configurations.However, I used ChatGPT as a coding assistant throughout the process — similar to how one might consult technical documentation or a senior developer for feedback.


-Specifically, AI assistance was used in the following ways:

    When debugging runtime errors or unexpected behavior

    To clarify DNS edge cases (e.g., CNAME chaining and loop prevention)

    To validate whether my approach aligned with best backend practices

    To help improve expressiveness or clarity in certain parts of the logic
    
    Marked AI-generated code: portions of dnsController.js, logWorker.js, and loggerQueue.js were generated or refactored with assistance from ChatGPT.


-All suggestions or code snippets provided by ChatGPT were manually tested, adapted to the project structure, and reviewed in the context of the functional requirements.
Final decisions, implementations, and architectural choices were mine.

-This project is a reflection of my understanding of backend systems and Node.js.
-AI tools were used as supplementary resources — not as a replacement for core development responsibilities.





###-Developer-###
 -Ali Riza Sevgili-