import {
  Footer,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterIcon,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
} from "flowbite-react";
import {
  BsDribbble,
  BsFacebook,
  BsGithub,
  BsInstagram,
  BsTwitter,
} from "react-icons/bs";
import logo from '../assets/Images/logo7.webp'

export default function FooterS() {
  return (
    <Footer container>
      <div className="w-full mb-16 ">
        <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
          <span className="flex my-2">
            <div className="w-12 h-12 rounded-full border-2 overflow-hidden">
              <img 
                src={logo} 
                alt="logo" 
                loading="lazy"
                className="w-full h-full object-cover scale-110 transition-transform duration-300"
              />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Portify</h1>
          </span>
          <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <FooterTitle title="Links" />
              <FooterLinkGroup col>
                <FooterLink href="#">Flowbite</FooterLink>
                <FooterLink href="#">Tailwind CSS</FooterLink>
              </FooterLinkGroup>
            </div>
            <div className="flex flex-col  space-y-2">
              <FooterTitle title="Follow us" />
              <FooterLinkGroup row className="flex gap-2">
                <FooterIcon href="#" icon={BsGithub} />
                <FooterLink href="#">Github</FooterLink>
              </FooterLinkGroup>
              <FooterLinkGroup row className="flex gap-2">
                <FooterIcon href="#" icon={BsFacebook} />
                <FooterLink href="#">Facebook</FooterLink>
              </FooterLinkGroup>
              <FooterLinkGroup row className="flex gap-2">
                <FooterIcon href="#" icon={BsInstagram} />
                <FooterLink href="#">Instagram</FooterLink>
              </FooterLinkGroup>
              <FooterLinkGroup row className="flex gap-2">
                <FooterIcon href="#" icon={BsTwitter} />
                <FooterLink href="#">Twitter</FooterLink>
              </FooterLinkGroup>
            </div>
            <div>
              <FooterTitle title="Legal" />
              <FooterLinkGroup col>
                <FooterLink href="#">Privacy Policy</FooterLink>
                <FooterLink href="#">Terms &amp; Conditions</FooterLink>
              </FooterLinkGroup>
            </div>
          </div>
        </div>
        {/* <FooterDivider /> */}
        {/* <div className="w-full sm:flex sm:items-center sm:justify-between">
          <FooterCopyright href="#" by="Flowbite™" year={2022} />
        </div> */}
      </div>
    </Footer>
  );
}
