import {styled} from "@mui/material/styles";
import {Chip} from "@mui/material";
import {EntityIcon} from "@/app/components/icons/EntityIcons";


const EntityChip=styled(Chip, {shouldForwardProp: (prop) => prop !== 'entityType'} )(
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

export default function TypeChip({ type }) {
    return (
        <EntityChip
            icon={<EntityIcon type={type} />}
            label={type}
            entityType={type} />
    );


};