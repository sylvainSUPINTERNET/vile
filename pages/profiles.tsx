
import type { NextPage } from 'next'
import { Profile } from '../types/Profile'

const Profiles = ({ profiles } : {profiles: Profile[] } ) => {
    return (
        <div>
            {
                profiles.length > 0 && profiles.map( (profile:Profile, i:number) => {
                    return <div key={i}>
                        {profile.name}
                    </div>
                })
            }
            <p>Lets go : {profiles.length}</p>
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