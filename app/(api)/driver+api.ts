import { neon } from '@neondatabase/serverless';

export async function GET(){
    try {
    const sql =  neon(`${process.env.DATABASE_URL}`);
   
    const drivers =  await sql`SELECT * FROM drivers`;


    return new Response(JSON.stringify({data: drivers}),{
        status: 201,
    });
        
    } catch (error) {
        console.log("DRIVER:", error);
        return Response.json(
            {error: error},
            {status: 500}
        )
    }
}