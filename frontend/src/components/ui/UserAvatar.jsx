// export default function UserAvatar({ name }) {
//   const getInitials = (name) => {
//     if (!name) return 'JM'; // Default fallback
//     const names = name.split(' ');
//     if (names.length >= 2) {
//       return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
//     }
//     return name.charAt(0).toUpperCase() + (name.charAt(1) || '').toUpperCase();
//   };

//   return (
//     <div className="w-8 h-8 bg-emerald-800 rounded-full flex items-center justify-center">
//       <span className="text-white font-semibold text-sm">
//         {getInitials(name)}
//       </span>
//     </div>
//   );
// }

const UserAvatar = ({ name, size = "md", className = "" }) => {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  return (
    <div
      className={`
      ${sizeClasses[size]} 
      bg-gradient-to-br from-emerald-500 to-emerald-800 
      rounded-full 
      flex items-center justify-center 
      text-white font-semibold 
      shadow-md
      ${className}
    `}
    >
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;
