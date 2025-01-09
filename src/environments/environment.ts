export const environment = {
    production:false,
    auth:{
        domain: process.env["VITE_DOMAIN"],
        clientId: process.env["VITE_CLIENTID"]
    }
}