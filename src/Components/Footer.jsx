import {
  Footer,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterIcon,
  FooterLinkGroup,
  FooterTitle,
} from "flowbite-react";
import {
  BsGithub,
  BsFacebook,
  BsInstagram,
  BsTwitter,
  BsLinkedin,
} from "react-icons/bs";
import logo from "../../public/favicon/logo.png";
import { Link } from "react-router-dom";

export default function FooterS() {
  const year = new Date().getFullYear();

  return (
    <Footer container className="bg-background border-t pt-8 mt-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex md-max:flex-col justify-between gap-0">
          {/* Brand */}
          <div className="w-full max-w-xl ">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-md border overflow-hidden">
                <img
                  src={logo}
                  alt="logo"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300"
                />
              </div>
              <h1 className="text-2xl mt-1 text-foreground font-proxemic">
                Por<span className="text-[#EE4B2B]">tify</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Build and showcase your portfolio in minutes. Customize, share,
              and shine.
            </p>
          </div>

          {/* Useful Links */}
          <div className="flex justify-between md:gap-10 lg:gap-24 md-max:gap-5 w-full max-w-xs ">
            <div>
              <FooterTitle title="Use Links" />
              <FooterLinkGroup col>
                <Link
                  to="/#Hero"
                  className="hover:text-[#EE4B2B] transition-colors duration-200"
                >
                  Home
                </Link>
                <Link
                  to="/#About"
                  className="hover:text-[#EE4B2B] transition-colors duration-200"
                >
                  About
                </Link>
                <Link
                  to="/#Feedback"
                  className="hover:text-[#EE4B2B] transition-colors duration-200"
                >
                  Feedback
                </Link>
                <Link
                  to="/signin"
                  className="hover:text-[#EE4B2B] transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="hover:text-[#EE4B2B] transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </FooterLinkGroup>
            </div>

            {/* Legal & Social */}
            <div>
              <FooterTitle title="Legal & Social" />
              <FooterLinkGroup col>
                <Link
                  to="/PrivacyPolicy"
                  className="hover:text-[#EE4B2B] transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/Terms&Condition"
                  className="hover:text-[#EE4B2B] transition-colors duration-200"
                >
                  Terms & Conditions
                </Link>
                <div className="flex gap-3 mt-3">
                  <FooterIcon
                    target="_blank"
                    href="https://github.com/AmitNare"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-[#5c5b5b] transition-colors duration-200 text-xl"
                    icon={BsGithub}
                  />
                  <FooterIcon
                    target="_blank"
                    href="https://www.linkedin.com/in/amit-nare"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-[#0A66C2] transition-colors duration-200 text-lg"
                    icon={BsLinkedin}
                  />
                </div>
              </FooterLinkGroup>
            </div>
          </div>
        </div>

        <FooterDivider className="my-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <FooterCopyright by="Portify™" year={year} />
          <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
            Empowering creators & developers everywhere.
          </p>
        </div>
      </div>
    </Footer>
  );
}
