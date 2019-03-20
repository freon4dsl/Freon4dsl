import axios from 'axios';

async function putData() {
    console.log("Ha");
    try {
        const res = await axios.put('/putModel', {
            user: "Joshua",
            children: [{ name: "Martin" }, { name: "Robert" }]
        }, { proxy: { host: "127.0.0.1", port: 3001 } });
        console.log(res.data + " is " + typeof res.data.massage.user);
        console.log(res.data.massage.user);
    } catch (e) {
        console.log("Error " + e.toString());
    }
    console.log("Done")
}

async function getData() {
    console.log("Ha get");
    try {
        const res = await axios.get('/getModel', { proxy: { host: "127.0.0.1", port: 3001 } });
        console.log(res.data + " is " + typeof res.data);

        console.log(JSON.stringify(res.data));
    } catch (e) {
        console.log("Error " + e.toString());
    }
    console.log("Done");
}

getData();
