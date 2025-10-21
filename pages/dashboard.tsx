import { GetServerSidePropsContext } from "next";
import { authenticateTokenSSR } from "../lib/auth";

export default function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
}

export const getServerSideProps = authenticateTokenSSR(async (context: GetServerSidePropsContext) => {
    return {
        props: {
 
        },
    };
});