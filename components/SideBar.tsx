'use client';
import Link from "next/link";
import Image from "next/image";
import {sidebarLinks} from "@/constants";
import {cn} from "@/lib/utils";
import {usePathname} from "next/navigation";

const SideBar = ({user}: SidebarProps) => {
    const pathName = usePathname();
    return (
        <section className={'sidebar'}>
            <nav className={'flex flex-col gap-4'}>
                <Link
                    href={'/'}
                    className={'mb-12 cursor-pointer gap-2 items-center flex'}
                >
                    <Image
                        src={'/icons/logo.svg'}
                        alt={'horizon_logo'}
                        className={'size-[24px] max-xl:size-14'}
                        width={34}
                        height={34}
                    />
                    <h1 className={'sidebar-logo'}>Horizon</h1>
                </Link>
                {
                    sidebarLinks.map(
                        (sidebarLink) => {
                            const isActive = pathName === sidebarLink.route || pathName.startsWith(`${sidebarLink.route}/`)
                            return (
                                <Link
                                    href={sidebarLink.route}
                                    key={sidebarLink.label}
                                    className={
                                        cn(
                                            'sidebar-link', {
                                                'bg-bank-gradient': isActive
                                            }
                                        )
                                    }
                                >
                                    <div className="relative size-6">
                                        <Image
                                            src={sidebarLink.imgURL}
                                            alt={sidebarLink.label}
                                            fill
                                            className={
                                                cn({
                                                    'brightness-[3] invert-0': isActive
                                                })
                                            }
                                        />
                                    </div>
                                    <p
                                        className={
                                            cn(
                                                'sidebar-label', {
                                                    '!text-white': isActive
                                                }
                                            )
                                        }
                                    >
                                        {sidebarLink.label}
                                    </p>
                                </Link>
                            )
                        }
                    )
                }

            </nav>
        </section>
    );
};

export default SideBar;
