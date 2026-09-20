import {getChatGPTUser,chatGPTSignInPath} from './chatgpt-auth';
import Callit from './callit';
export const dynamic='force-dynamic';
export default async function Home(){const user=await getChatGPTUser();return <Callit signedIn={!!user} signIn={chatGPTSignInPath('/')} initialName={user?.fullName??''}/>;}
