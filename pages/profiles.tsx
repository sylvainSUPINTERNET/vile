import type { NextPage } from 'next'
import { useEffect , useRef, useState} from 'react';
import { Profile } from '../types/Profile';
import * as signalR from "@microsoft/signalr";
import { nanoid } from 'nanoid'

//import Peer from 'peerjs';

// const getDevicesAndApplyStream = async (videoObject: any) => {
//     const devices = await window.navigator
//                             .mediaDevices
//                             .enumerateDevices();
    

//     try { 
//         const stream = await window.navigator.mediaDevices.getUserMedia({
//             video: true,
//             audio: true
//         });
    
//         videoObject.srcObject = stream;
//         videoObject.play();
//         return new Promise( resolve => resolve(stream));
//     } catch ( e ) {
//         console.log("Error : ", e);
//     }

// }

const peerInit = async () => {
    const peerjs = await import('peerjs');
    return new Promise( (resolve) => {
        resolve(peerjs.default);
    })
}

const peerInstance = async (hubConnection: any) => {
    const Peer:any = await peerInit();
    let p = new Peer(nanoid())

    hubConnection.invoke("JoinLake", p._id);
    hubConnection.invoke("FindSomeone", p._id);

    return new Promise( resolve => resolve(p));

}


// https://stackoverflow.com/questions/58975883/prevent-rerender-for-every-setstate-using-react-usestate-hook

const Profiles = ({ profiles } : {profiles: Profile[] } ) => {
    let videoObject:any = useRef(null);
    let videoObjectOther:any = useRef(null);

    let [hubConnection, setHubConnection] = useState({});

    let peerConnectionRef = useRef();

    useEffect( () => {
        

        //getDevicesAndApplyStream(videoObject.current);

        let connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/profilehub").build();
        // @ts-ignore
        setHubConnection(connection);


        // Receiver
        connection.on('newPeerOfferSend', async ( targetPeerId:string ) => {

            const stream = await window.navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            console.log(videoObject);

            videoObject.current.srcObject = stream;
            videoObject.current.play();

            
            //@ts-ignore
            peerConnectionRef.current.on('call' , (call:any) => {
                call.answer(stream); // answer with stream
                call.on('stream', (remoteStream:any) => {
                    console.log("ANSWER CALL");
                    console.log(remoteStream);
                        
                                            
                    videoObjectOther.current.srcObject = remoteStream;
                    videoObjectOther.current.play();
                    /// Show stream in some <video> element.
                })
            })



            //@ts-ignore
            // peerConnectionRef.current.on('connection', (conn:any) => {
            //     conn.on('data', (data:any) => {
            //         console.log(data);
            //       });
            // })
        });


        // Initiator
        connection.on('newPeerOffer', async ( offerPeerId:string ) => {
            const stream = await window.navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

                            
            videoObject.current.srcObject = stream;
            videoObject.current.play();

            //@ts-ignore
            const call = peerConnectionRef.current.call(offerPeerId, stream);
            call.on('stream', (remoteStream: any) => {
                console.log("LESSS GO STREAM23°")
                console.log(remoteStream);
           
                videoObjectOther.current.srcObject = remoteStream;
                videoObjectOther.current.play();
                    // Show stream in some <video> element.
            })

            //@ts-ignore
            //let pConn = peerConnectionRef.current.connect(offerPeerId);
            // pConn.on('open', () => {
            //     console.log("OPEN")
            //     pConn.send("HELLO");
            // });
        })
    }, []);


    const onClickStart = (ev:any) => {
        if ( hubConnection ) {
            //@ts-ignore
            hubConnection.start()
                .then( async () => {
                    let m = await peerInstance(hubConnection);

                    //@ts-ignore
                    peerConnectionRef.current = m;
                });
        }    
    }

    const onClickStop = (ev:any) => {
    }

    return (
        <div>

            <button onClick={ onClickStart }>Start</button>
            <button onClick={ onClickStop }>Stop</button>

            <div style={{"background": "green", "display": "flex", "justifyContent": "center", "flexFlow": "column"}}>

                <div style={{"display": "flex"}}>
                    <div style={{"background": "red", "flex": "0 0 15%"}} >
                            <video ref={videoObjectOther} style={{"maxWidth": "30em"}}>
                            </video>
                    </div>
                </div>

                <div style={{"display": "flex"}}>
                    <div style={{"background": "blue", "flex": "0 0 15%"}} >
                            <video ref={videoObject} style={{"maxWidth": "30em"}}>
                            </video>
                    </div>
                </div>
            </div>



            {/* {
                profiles.length > 0 && profiles.map( (profile:Profile, i:number) => {
                    return <div key={i}>
                        <div className="card">
                            {profile.name}
                            <button className="btn btn-primary">Ok</button>
                        </div>
                    </div>
                })
            }
            <p>Lets go : {profiles.length}</p>
             */}
        </div>
    )
}

export async function getStaticProps(context: any) {
    const profiles: Profile[] = [{
        name: "Sylvain",
        age: 10
    }, {
        name: "Neung",
        age: 10
    }];
    return {
        props: { profiles }
    }
}

export default Profiles;