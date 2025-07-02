export const dynamic = "force-static"; // disables static caching

export default async function ServerStatic(){
  return <p>This is ServerStatic rendered time {Date.now()}</p>
}
