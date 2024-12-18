import {Breadcrumbs, Typography} from "@mui/material";
import Link from "next/link";


export default function EntityBreadcrumbs({ links }){

    return (
        <Breadcrumbs>
            {links.map(crumb => (
                <Link href={crumb[0]} style={{ textDecoration: 'none' }}>
                    <Typography sx={{
                        "&:hover": { textDecoration: "underline" }
                    }}>{crumb[1]}</Typography>
                </Link>
            ))}
        </Breadcrumbs>
    )


}














