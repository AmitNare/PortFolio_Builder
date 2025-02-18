import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Link } from "react-router-dom"

export const description =
    "A sign up form with first name, last name, email and password inside a card. There's an option to sign up with GitHub and a link to login if you already have an account"

export default function CardTemplete(props) {
    return (
        <>
            <div className={` bg-background text-foreground w-full    `}>

                <Card className="mx-auto w-full ">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            {props.title}
                        </CardTitle>
                        <CardDescription>
                            {props.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {props.content}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
