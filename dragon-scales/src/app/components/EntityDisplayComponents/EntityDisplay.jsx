"use client"

import { useState, useEffect } from "react";
import { getEntity } from "@/app/calls";
import { Box, Typography, Card, CardHeader, CardContent, Chip, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { EntityIcon } from "../icons/EntityIcons";

const Header=styled(CardHeader, {shouldForwardProp: (prop) => prop !== 'entityType'} )(
    ({ theme, entityType }) => ({
        color: theme.palette.entities.text[entityType],
        backgroundColor: theme.palette.entities.background[entityType],
    })
);

const HeaderChip=styled(Chip, {shouldForwardProp: (prop) => prop !== 'entityType'} )(
    ({ theme, entityType }) => ({
        marginRight: 16,
        marginLeft: 1,
        color: theme.palette.entities.text[entityType],
        backgroundColor: 'transparent',
        border: `1px solid ${theme.palette.entities.text[entityType]}`,
        borderRadius: 16,
        '& .MuiChip-icon': {
            color: theme.palette.entities.text[entityType],
        }
    })
);

export default function EntityDisplay({ entityId }) {

    const [entity, setEntity] = useState({})

    useEffect(() => {
        getEntity(entityId).then((data) => {
            if (data) {
                setEntity(JSON.parse(data));
            } else {
                setEntity(null);
            }
        });
    }, [entityId]);

    return (
        entity === null ? (
            <Typography variant="h3">Error loading entity with id {entityId} please try again</Typography>
        ) : Object.keys(entity).length === 0 ? (
            <Typography variant="h3">Loading...</Typography>
        ) : (
            <Card sx={{ margin: 'inherit'}}>
                <Header title={
                        <Box display="flex" alignItems="center">
                            <HeaderChip 
                            icon={<EntityIcon type={entity.type} />} 
                            label={entity.type}
                            entityType={entity.type} />
                            <Typography variant="h5">
                                {entity.name}
                            </Typography>
                        </Box>
                    }
                    entityType={entity.type}
                />
                <CardContent>
                    <Stack spacing={2}>
                        {entity.children && entity.children.map(child => (
                            <EntityDisplay key={child} entityId={child} />
                            ))}
                    </Stack>
                </CardContent>
            </Card>
        )
    )

}







