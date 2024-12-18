import {Breadcrumbs, Typography} from "@mui/material";
import Link from "next/link";


export default function EntityBreadcrumbs({ links }){

    return (
        <Breadcrumbs>
            {links.map(crumb => (
                <Link key={crumb + '-crumb'} href={crumb[0]} style={{ textDecoration: 'none' }}>
                    <Typography sx={{
                        variant: "body1",
                        "&:hover": { textDecoration: "underline" }
                    }}>{crumb[1]}</Typography>
                </Link>
            ))}
        </Breadcrumbs>
    )


}














